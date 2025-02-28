const apiKey = "sk-9741643783ec477685dfb26a9ce04727";

export const askDS = async (messages, onDataChunk) => {
  try {
    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`, // 对应你的key
          "Content-Type": "application/json", // 指定返回json格式的
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          max_tokens: 4096,
          temperature: 1.0,
          stream: true, // 不是流格式的必须为false
        }),
      }
    );

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = ""; // 用于保存未处理完的分块数据

    while (true) {
      const { done, value } = await reader.read();
      if (done) break; // 读取结束

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk; // 将新数据拼接到缓冲区

      // 按换行符分割数据块
      const lines = buffer.split("\n");

      // 最后一行可能是不完整数据块，留到下一次处理
      buffer = lines.pop();
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim(); // 去掉 "data: " 前缀
          if (jsonStr !== "[DONE]") {
            try {
              const jsonData = JSON.parse(jsonStr);
              const content = jsonData?.choices[0]?.delta?.content || "";
              const isStop = jsonData?.choices[0]?.finish_reason || "";
              // 实时触发回调  这个回调是为了能在页面上实时输出
              onDataChunk(content, isStop === "stop");
            } catch (error) {
              console.error("解析 JSON 数据失败:", error, line);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("请求错误：", error);
    return null;
  }
};
