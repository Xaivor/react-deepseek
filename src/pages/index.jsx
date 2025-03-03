import React, { useState, useMemo, useEffect } from "react";
import { v4 as uuid4 } from "uuid";
import { askDS } from "./../request/deepseek";
import { MdPreview } from "md-editor-rt";
import "md-editor-rt/lib/style.css";
import "./index.css";
import { CHAT_ROLE_LIST } from "./chat";

const Index = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [roleList, setRoleList] = useState(CHAT_ROLE_LIST);
  const [roleIdx, setRoleIdx] = useState(0);
  const [showRoleWrap, setShowRoleWrap] = useState(false);
  const [showRoleList, setShowRoleList] = useState(false);
  const [hisList, setHisList] = useState([]);
  const [showHisWrap, setShowHisWrap] = useState(false);
  const [showHisList, setShowHisList] = useState(false);
  const [hisId, setHisId] = useState("");

  const roleItem = useMemo(() => roleList[roleIdx], [roleIdx, roleList]);

  const changeText = (event) => {
    setText(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendText();
    }
  };

  const animateRoleWrap = (visable) => {
    if (loading) return;
    if (visable) {
      setShowRoleWrap(true);
      setTimeout(() => {
        setShowRoleList(true);
      }, 100);
    } else {
      setShowRoleList(false);
      setTimeout(() => {
        setShowRoleWrap(false);
      }, 300);
    }
  };

  const animateHisWrap = (visable) => {
    if (loading) return;

    if (visable) {
      setShowHisWrap(true);
      setTimeout(() => {
        setShowHisList(true);
      }, 100);
    } else {
      setShowHisList(false);
      setTimeout(() => {
        setShowHisWrap(false);
      }, 300);
    }
  };

  const selectRole = (index) => {
    setRoleIdx(index);
    animateRoleWrap(false);
  };

  const sendText = () => {
    // 提前返回条件
    if (!text || loading) return;

    // 清空输入框并设置加载状态
    setText("");
    setLoading(true);

    // 创建新的用户消息
    const userMessage = { role: "user", content: text };
    const updatedChatList = [...chatList, userMessage];

    // 添加助手的“正在思考中...”消息
    const thinkingMessage = { role: "assistant", content: "正在思考中..." };
    setChatList([...updatedChatList, thinkingMessage]);

    document.getElementById("chat-scroll").scrollTo(0, 99999);

    // 准备请求的聊天记录
    const systemMessage = {
      content: roleItem.content,
      role: "system",
    };
    let askChatList = [systemMessage, ...updatedChatList];

    // 算命大师过滤自己的结果
    if (roleItem.id === 3 && chatList.length > 1) {
      askChatList = [
        systemMessage,
        ...chatList.filter((item) => item.role === "user"),
      ];
    }

    // 记录开始时间
    const startTime = new Date().getTime();
    let responseTime = "";

    // 定义回调函数处理响应
    let oldContent = "";
    const handleResponse = (content, isStop) => {
      if (!responseTime) {
        responseTime = ((new Date().getTime() - startTime) / 1000).toFixed(2);
      }

      // 更新聊天记录
      oldContent += content;
      const assistantMessage = {
        role: "assistant",
        content: oldContent,
        time: responseTime,
      };
      setChatList([...updatedChatList, assistantMessage]);

      // 如果响应结束，取消加载状态
      if (isStop) {
        setLoading(false);
        saveLocalChatList([...updatedChatList, assistantMessage]);
      }
    };

    // 发送请求
    askDS(askChatList, handleResponse);
  };

  // 保存聊天记录到本地
  const saveLocalChatList = (list) => {
    const key = `chatList-${roleItem.id}`;
    const localChatList = JSON.parse(localStorage.getItem(key) ?? "[]");
    const id = hisId || uuid4();

    setHisId(id);

    const item = {
      title: list[1]?.content,
      id,
      list,
    };

    const idx = localChatList.findIndex(
      (existingItem) => existingItem.id === id
    );
    if (idx > -1) {
      localChatList[idx] = item;
    } else {
      localChatList.push(item);
    }

    localStorage.setItem(key, JSON.stringify(localChatList));
    loadLocalChatList();
  };

  const setLocalChatList = (item) => {
    setHisId(item.id);
    setChatList(item.list);
    animateHisWrap(false);
  };

  const loadLocalChatList = () => {
    const key = `chatList-${roleItem.id}`;
    const localChatList = localStorage.getItem(key)
      ? JSON.parse(localStorage.getItem(key))
      : [];

    setHisList(localChatList);
  };

  const deleteLocalChatList = (index) => {
    const key = `chatList-${roleItem.id}`;
    const localChatList = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (hisId === localChatList[index].id) {
      newChat();
    }

    localChatList.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(localChatList));
    loadLocalChatList();
  };

  const deleteAllLocalChatList = () => {
    const key = `chatList-${roleItem.id}`;
    localStorage.removeItem(key);
    setHisList([]);
    newChat();
  };

  const newChat = () => {
    if (loading) return;

    setChatList([]);
    setHisId("");
    setText("");
  };

  useEffect(() => {
    loadLocalChatList();
    newChat();
  }, [roleIdx]);

  // 导航栏组件
  const NavBar = () => {
    return (
      <div className="nav-bar">
        <div className="nav-left" onClick={() => animateHisWrap(true)}>
          <div className="iconfont icon-time-circle"></div>
        </div>
        <div className="nav-bar-title">
          <span>{roleItem.name}</span>
          <div className="role-change" onClick={() => animateRoleWrap(true)}>
            <span>切换</span>
            <div className="iconfont icon-swap"></div>
          </div>
        </div>
      </div>
    );
  };

  // 角色列表设定弹窗组件
  const RoleListPopup = () => {
    return (
      showRoleWrap && (
        <div className={`role-wrap ${showRoleList ? "show" : ""}`}>
          <div
            className={`opacity-wrap ${showRoleList ? "show" : ""}`}
            onClick={() => animateRoleWrap(false)}
          ></div>
          <div className="role-list">
            {roleList.map((item, index) => (
              <div
                key={index}
                className={`role-item ${roleIdx === index ? "active" : ""}`}
                onClick={() => selectRole(index)}
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      )
    );
  };

  // 左侧聊天历史抽屉弹窗组件
  const ChatHistoryPopup = () => {
    return (
      showHisWrap && (
        <div className={`role-wrap ${showHisList ? "show" : ""}`}>
          <div
            className={`opacity-wrap ${showHisList ? "show" : ""}`}
            onClick={() => animateHisWrap(false)}
          ></div>
          <div className={`his-wrap ${showHisList ? "show" : ""}`}>
            <div className="his-title">历史记录</div>
            <div className="his-list">
              {hisList.map((item, index) => (
                <div className="his-item-wrap">
                  <div
                    key={index}
                    className="his-item"
                    onClick={() => {
                      setLocalChatList(item);
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    className="iconfont icon-delete"
                    onClick={() => {
                      deleteLocalChatList(index);
                    }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="his-bottom">
              <div className="his-delete" onClick={deleteAllLocalChatList}>
                清空历史
              </div>
            </div>
          </div>
        </div>
      )
    );
  };

  // 聊天内容组件
  const ChatContent = () => {
    return (
      <div className="page-content" id="chat-scroll">
        {chatList.map((item, index) => (
          <div key={index} className={`chat-item ${item.role}`}>
            {item.role === "user" ? (
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
    );
  };

  // 聊天输入框组件
  const ChatInput = () => {
    return (
      <div className="textarea-wrap">
        <textarea
          className="textarea"
          placeholder={roleItem.placeholder}
          value={text}
          onChange={changeText}
          onKeyDown={handleKeyDown}
        />
        <div className="textarea-btns">
          <button className="text-btn" onClick={newChat}>
            新建对话
          </button>
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
    );
  };

  return (
    <div className="page-wrap">
      <NavBar />
      <RoleListPopup />
      <ChatHistoryPopup />
      <ChatContent />
      <ChatInput />
    </div>
  );
};

export default Index;
