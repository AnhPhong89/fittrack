'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { useWeight } from '@/hooks/use-weight';
import { useNutrition } from '@/hooks/use-nutrition';
import { useExercise } from '@/hooks/use-exercise';
import { calculateBMI, calculateBMR, calculateTDEE, getTodayISO } from '@/lib/calculations';
import { Bot, Send, User, Sparkles, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  'Phân tích tiến độ giảm cân của tôi',
  'Gợi ý thực đơn giảm cân 1 ngày',
  'Bài tập nào đốt calo hiệu quả nhất?',
  'Làm sao để duy trì động lực?',
  'Tôi nên ăn bao nhiêu protein mỗi ngày?',
  'Chế độ ăn intermittent fasting có hiệu quả không?',
];

function generateMockResponse(input: string, context: string): string {
  const lower = input.toLowerCase();

  if (lower.includes('tiến độ') || lower.includes('phân tích') || lower.includes('progress')) {
    return `📊 **Phân tích tiến độ của bạn:**\n\n${context}\n\nDựa trên dữ liệu, bạn đang đi đúng hướng! 🎯 Hãy tiếp tục duy trì thói quen tốt này. Nhớ nhập cân nặng mỗi sáng để theo dõi chính xác nhé.`;
  }
  if (lower.includes('thực đơn') || lower.includes('ăn gì') || lower.includes('bữa ăn')) {
    return `🥗 **Thực đơn giảm cân gợi ý:**\n\n**Bữa sáng (~350 kcal):**\n• 2 quả trứng luộc + bánh mì đen\n• 1 ly sữa tách béo hoặc sữa hạt\n\n**Bữa trưa (~500 kcal):**\n• Cơm gạo lứt (1 chén) + ức gà nướng + rau xanh luộc\n\n**Bữa tối (~400 kcal):**\n• Salad rau trộn dầu olive + cá hồi áp chảo\n\n**Ăn vặt lành mạnh:**\n• Hoa quả tươi, sữa chua không đường, hạt mixed nuts\n\n💡 *Uống đủ 2L nước mỗi ngày và ăn chậm để no lâu hơn!*`;
  }
  if (lower.includes('bài tập') || lower.includes('tập luyện') || lower.includes('exercise') || lower.includes('calo')) {
    return `💪 **Bài tập đốt calo hiệu quả nhất:**\n\n🏃 **Cardio cường độ cao (HIIT)** - ~500-800 kcal/giờ\n• Nhảy dây, Burpees, Jumping jacks\n• Chạy bộ tốc độ cao xen kẽ\n\n🚴 **Cardio bền** - ~300-500 kcal/giờ\n• Đạp xe, bơi lội, chạy bộ\n\n🏋️ **Sức mạnh** - ~200-400 kcal/giờ\n• Squat, deadlift, push-up\n• Tăng cường trao đổi chất sau tập!\n\n✅ **Gợi ý:** Kết hợp 3 ngày cardio + 2 ngày sức mạnh mỗi tuần để tối ưu giảm cân.`;
  }
  if (lower.includes('động lực') || lower.includes('motivation')) {
    return `🔥 **Bí quyết duy trì động lực:**\n\n1. **Đặt mục tiêu nhỏ** - Thay vì nghĩ đến 10kg, hãy tập trung vào 0.5kg/tuần\n\n2. **Theo dõi tiến độ** - Nhập cân mỗi sáng, chụp ảnh mỗi tháng để thấy sự thay đổi\n\n3. **Tự thưởng** - Hoàn thành 1 tuần → mua áo mới, xem phim...\n\n4. **Cộng đồng** - Chia sẻ hành trình với bạn bè hoặc tham gia group online\n\n5. **Nhớ lý do ban đầu** - Sức khỏe tốt hơn, tự tin hơn, sống lâu hơn!\n\n💪 Bạn đang làm rất tốt, đừng bỏ cuộc!`;
  }
  if (lower.includes('protein')) {
    return `🥩 **Nhu cầu Protein của bạn:**\n\nVới người đang giảm cân và tập luyện:\n• **Tối thiểu:** 1.2g × trọng lượng cơ thể (kg)\n• **Tối ưu:** 1.6-2.0g × trọng lượng cơ thể (kg)\n\n**Nguồn Protein tốt:**\n• Ức gà, cá, hải sản, trứng\n• Sữa chua Hy Lạp, phô mai tươi\n• Đậu phụ, đậu lăng, quinoa\n\n💡 *Protein giúp bảo tồn cơ bắp khi giảm cân và tăng cảm giác no. Ưu tiên ăn protein trước trong bữa ăn!*`;
  }
  if (lower.includes('intermittent') || lower.includes('nhịn ăn') || lower.includes('16:8')) {
    return `⏰ **Intermittent Fasting (IF) - Nhịn ăn gián đoạn:**\n\n**Phương pháp phổ biến:**\n• **16:8** - Nhịn 16h, ăn trong cửa sổ 8h (VD: 12h-20h)\n• **5:2** - Ăn bình thường 5 ngày, giảm calo 2 ngày\n\n**Ưu điểm:**\n✅ Giảm cân hiệu quả nếu kiểm soát lượng ăn tốt\n✅ Đơn giản, không cần tính từng bữa\n✅ Có thể cải thiện insulin sensitivity\n\n**Nhược điểm:**\n⚠️ Khó thực hiện ban đầu\n⚠️ Có thể gây mất cơ nếu không đủ protein\n\n💡 *Hiệu quả nhất khi kết hợp với ăn đủ chất và tập luyện đều đặn. Hỏi bác sĩ trước nếu có bệnh lý nền.*`;
  }

  return `🤖 **AI Coach FitTrack đây!**\n\nCảm ơn bạn đã hỏi: "${input}"\n\n${context}\n\nTôi luôn sẵn sàng tư vấn về:\n• 🥗 Dinh dưỡng và thực đơn\n• 💪 Bài tập phù hợp\n• 📊 Phân tích tiến độ\n• 🎯 Lập kế hoạch giảm cân\n\nHãy thử hỏi cụ thể hơn để tôi tư vấn chính xác nhé!`;
}

export default function AICoachPage() {
  const { profile } = useProfile();
  const { entries: weightEntries } = useWeight();
  const today = useMemo(() => getTodayISO(), []);
  const { totals } = useNutrition(today);
  const { totalCaloriesBurned } = useExercise(today);
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: '0',
      role: 'assistant',
      content: `Xin chào! 👋 Tôi là **AI Coach FitTrack** — trợ lý sức khỏe cá nhân của bạn.\n\nTôi có thể giúp bạn:\n• 🥗 Gợi ý thực đơn và dinh dưỡng\n• 💪 Tư vấn bài tập phù hợp\n• 📊 Phân tích tiến độ giảm cân\n• 🎯 Xây dựng kế hoạch đạt mục tiêu\n\nHãy hỏi tôi bất cứ điều gì về sức khỏe và fitness nhé!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getContext = () => {
    if (!profile) return '';
    const currentWeight = weightEntries.length ? weightEntries[weightEntries.length - 1].weight : profile.currentWeight;
    const bmi = calculateBMI(currentWeight, profile.height);
    const bmr = calculateBMR(currentWeight, profile.height, profile.age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activityLevel);
    return `📋 **Thông tin của bạn:**\n• Tên: ${profile.name}, ${profile.age} tuổi, ${profile.gender === 'male' ? 'Nam' : 'Nữ'}\n• Cân nặng hiện tại: ${currentWeight}kg → Mục tiêu: ${profile.targetWeight}kg\n• BMI: ${bmi.toFixed(1)}, TDEE: ${tdee.toFixed(0)} kcal/ngày\n• Hôm nay: nạp ${totals.calories} kcal, đốt ${totalCaloriesBurned} kcal`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate AI delay
    await new Promise((resolve) => setTimeout(resolve, 900 + Math.random() * 700));
    const context = getContext();
    const response = generateMockResponse(text, context);

    setMessages((prev) => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    }]);
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([{
      id: '0',
      role: 'assistant',
      content: 'Chat đã được xoá. Xin chào, tôi có thể giúp gì cho bạn hôm nay?',
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48,
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} className="pulse">
              <Bot size={24} color="white" />
            </div>
            <div>
              <h1 className="page-title" style={{ fontSize: 22 }}>AI Coach</h1>
              <p style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                Đang hoạt động
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={clearChat}>
            <RefreshCw size={14} /> Xoá chat
          </button>
        </div>
      </div>

      {/* Quick prompts */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {QUICK_PROMPTS.map((prompt) => (
          <button key={prompt} onClick={() => sendMessage(prompt)}
            style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
              background: 'var(--primary-light)', color: 'var(--primary)',
              border: '1px solid transparent', cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.color = 'var(--primary)'; }}
          >
            <Sparkles size={11} style={{ display: 'inline', marginRight: 4 }} />{prompt}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 4, marginBottom: 16 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: msg.role === 'assistant'
                ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
                : 'var(--muted)',
            }}>
              {msg.role === 'assistant' ? <Bot size={18} color="white" /> : <User size={18} color="var(--muted-foreground)" />}
            </div>
            <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}
              style={{ whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }}
            />
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={18} color="white" />
            </div>
            <div className="chat-bubble ai" style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '14px 18px' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)',
                  animation: `pulse-green 1.2s ease ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
        <input
          className="form-input"
          placeholder="Hỏi AI Coach về sức khỏe, dinh dưỡng, bài tập..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={!input.trim() || isLoading}
          style={{ padding: '10px 18px', opacity: !input.trim() || isLoading ? 0.6 : 1 }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
