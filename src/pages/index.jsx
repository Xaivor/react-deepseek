import React, { useState } from "react";
import { askDS } from "./../request/deepseek";
import { MdPreview } from "md-editor-rt";
import "md-editor-rt/lib/style.css";
import "./index.css";

const Index = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatList, setChatList] = useState([]);
  const changeText = (event) => {
    setText(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendText();
    }
  };

  const sendText = () => {
    if (!text || loading) {
      return;
    }

    setText("");
    setLoading(true);
    let newChatList = [...chatList, { role: "user", content: text }];
    setChatList([
      ...newChatList,
      {
        role: "assistant",
        content: "正在思考中...",
      },
    ]);

    let oldContent = "";
    let startTime = new Date().getTime();
    let time = "";
    askDS(newChatList, (content, isStop) => {
      if (!time) {
        time = ((new Date().getTime() - startTime) / 1000).toFixed(2);
      }

      oldContent += content;
      setChatList([
        ...newChatList,
        { role: "assistant", content: oldContent, time },
      ]);
      if (isStop) {
        setLoading(false);
      }
    });
  };

  return (
    <div className="page-wrap">
      <div className="page-content">
        {chatList.map((item, index) => (
          <div key={index} className={`chat-item ${item.role}`}>
            {item.role == "user" ? (
              item.content
            ) : (
              <div className="md-wrap">
                <MdPreview value={item.content} />
                {item.time && <div className="time">耗时：{item.time} 秒</div>}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="textarea-wrap">
        <textarea
          className="textarea"
          placeholder="请输入你想问的问题，回车enter可发送!"
          value={text}
          onChange={changeText}
          onKeyDown={handleKeyDown}
        />
        <div className="textarea-btns">
          {loading ? (
            <button className="btn disabled" disabled>
              思考中...
            </button>
          ) : (
            <button className="btn" onClick={sendText}>
              发送
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
