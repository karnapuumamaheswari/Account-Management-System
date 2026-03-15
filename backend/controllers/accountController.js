import { supabase } from '../config/supabaseClient.js'

async function loadUserDirectory(userIds) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))]

  if (!uniqueIds.length) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, name')
    .in('id', uniqueIds)

  if (error) {
    throw new Error(error.message)
  }

  return new Map(data.map((user) => [user.id, user.name]))
}

export async function getBalance(request, response) {
  const { data, error } = await supabase
    .from('users')
    .select('balance')
    .eq('id', request.user.id)
    .single()

  if (error) {
    return response.status(500).json({ message: error.message })
  }

  response.json({ balance: Number(data.balance) })
}

export async function getStatement(request, response) {
  const { data, error } = await supabase
    .from('transactions')
    .select(
      'id, sender_id, receiver_id, amount, transaction_type, balance_after_transaction, created_at',
    )
    .or(`sender_id.eq.${request.user.id},receiver_id.eq.${request.user.id}`)
    .order('created_at', { ascending: false })

  if (error) {
    return response.status(500).json({ message: error.message })
  }

  try {
    const userDirectory = await loadUserDirectory(
      data.flatMap((item) => [item.sender_id, item.receiver_id]),
    )

    const transactions = data.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
      balance_after_transaction: Number(transaction.balance_after_transaction),
      from_name:
        transaction.sender_id === request.user.id
          ? 'You'
          : userDirectory.get(transaction.sender_id) || 'Unknown',
      to_name:
        transaction.receiver_id === request.user.id
          ? 'You'
          : userDirectory.get(transaction.receiver_id) || 'Unknown',
    }))

    response.json({ transactions })
  } catch (mappingError) {
    response.status(500).json({ message: mappingError.message })
  }
}

export async function transferMoney(request, response) {
  const { receiverId, receiverEmail, amount } = request.body
  const senderId = request.user.id
  const transferAmount = Number(amount)
  let targetReceiverId = receiverId

  if ((!receiverId && !receiverEmail) || Number.isNaN(transferAmount)) {
    return response.status(400).json({ message: 'Receiver and valid amount are required' })
  }

  if (transferAmount <= 0) {
    return response.status(400).json({ message: 'Transfer amount must be greater than zero' })
  }

  if (!targetReceiverId && receiverEmail) {
    const normalizedEmail = receiverEmail.trim().toLowerCase()
    const { data: receiver, error: receiverLookupError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (receiverLookupError) {
      return response.status(500).json({ message: receiverLookupError.message })
    }

    if (!receiver) {
      return response.status(400).json({ message: 'Receiver not found' })
    }

    targetReceiverId = receiver.id
  }

  if (targetReceiverId === senderId) {
    return response.status(400).json({ message: 'You cannot transfer money to yourself' })
  }

  const { data, error } = await supabase.rpc('transfer_money', {
    p_sender_id: senderId,
    p_receiver_id: targetReceiverId,
    p_amount: transferAmount,
  })

  if (error) {
    const statusCode =
      error.message.includes('Receiver not found') ||
      error.message.includes('Insufficient balance')
        ? 400
        : 500

    return response.status(statusCode).json({ message: error.message })
  }

  response.status(201).json({
    message: 'Transfer completed successfully',
    result: data,
  })
}
