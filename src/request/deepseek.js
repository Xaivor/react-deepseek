const key = "deepseek-chat";
const apiConfig = {
  "deepseek-chat": {
    apiKey: "sk-9741643783ec477685dfb26a9ce04727",
    baseUrl: "https://api.deepseek.com/v1/chat/completions",
    model: "deepseek-chat",
  },
  "huoshan-chat": {
    apiKey: "1d0ce6d4-c6f1-422b-97ad-d824c61ba7b2",
    baseUrl: "/api/chat/completions",
    model: "ep-20250303155332-t7vp4",
  },
  localhost: {
    baseUrl: "http://192.168.14.179:11434/api/chat",
    model: "deepseek-r1:1.5b",
  },
};

const { baseUrl, apiKey = "", model } = apiConfig[key];

export const askDS = async (messages, onDataChunk) => {
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`, // 对应你的key
        "Content-Type": "application/json", // 指定返回json格式的
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 4096,
        temperature: 0.8,
        stream: true, // 不是流格式的必须为false
      }),
    });

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
        // try {
        //   const jsonData = JSON.parse(line);
        //   const content = jsonData?.message?.content || "";
        //   const isStop = jsonData?.done || false;
        //   // 实时触发回调  这个回调是为了能在页面上实时输出
        //   onDataChunk(content, isStop);
        // } catch (error) {
        //   console.error("解析 JSON 数据失败:", error, line);
        // }

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
