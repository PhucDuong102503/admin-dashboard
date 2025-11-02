const handleSend = async () => {
  if (!input.trim()) return;

  const newMessage = {
    sender_id: String(currentUser.id),
    receiver_id: String(targetUser.id),
    content: input,
    conversationKey: chatId,
    created_at: serverTimestamp(),
    read: false,
  };

  try {
    await addDoc(collection(db, "messages"), newMessage);
    setInput(""); // chỉ reset input, KHÔNG tự push vào state
  } catch (error) {
    console.error("❌ Lỗi khi gửi tin nhắn:", error);
  }
};
