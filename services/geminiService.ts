import { GoogleGenAI } from "@google/genai";
import { FuelRequest, FuelPrice, RequestStatus } from "../types";

const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeFuelData = async (
  requests: FuelRequest[],
  prices: FuelPrice[]
): Promise<string> => {
  try {
    const ai = getGeminiClient();
    
    // Filter only approved requests for analysis
    const approvedRequests = requests.filter(r => r.status === RequestStatus.APPROVED);

    if (approvedRequests.length === 0) {
      return "Chưa có dữ liệu đổ dầu đã duyệt để phân tích.";
    }

    const dataSummary = {
      totalRequests: requests.length,
      approvedCount: approvedRequests.length,
      recentPrices: prices.slice(0, 5),
      transactions: approvedRequests.map(r => ({
        date: r.requestDate,
        amount: r.approvedAmount,
        liters: r.approvedLiters,
        driver: r.driverName
      }))
    };

    const prompt = `
      Bạn là trợ lý phân tích dữ liệu cho một hệ thống quản lý nhiên liệu vận tải.
      Dưới đây là dữ liệu giao dịch gần đây (định dạng JSON):
      ${JSON.stringify(dataSummary, null, 2)}

      Hãy phân tích ngắn gọn bằng tiếng Việt (tối đa 3-4 câu) về:
      1. Tổng chi tiêu.
      2. Xu hướng giá dầu (nếu có thông tin).
      3. Bất kỳ điều gì bất thường hoặc đáng chú ý về hiệu quả tiêu thụ.
      
      Giữ giọng văn chuyên nghiệp, hữu ích.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Không thể tạo báo cáo vào lúc này.";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Đã xảy ra lỗi khi kết nối với AI để phân tích dữ liệu.";
  }
};