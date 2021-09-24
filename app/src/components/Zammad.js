import { useEffect } from "react";
import { useSelector } from "react-redux";
import { adminURL } from "../config";
import api from "../services/api";

function sendMessage(chat, message) {
  chat.send("chat_session_message", {
    content: message.join("<br />"),
    id: chat._messageCount,
    session_id: chat.sessionId,
  });
}

export default function Zammad() {
  const young = useSelector((state) => state.Auth.young);

  useEffect(() => {
    if (!window) return;

    window.$(function () {
      if (typeof ZammadChat === "undefined") return;

      const chat = new ZammadChat({
        title: "Une question ?",
        background: "#5145cd",
        fontSize: "12px",
        chatId: 4,
        show: true,
        flat: true,
        target: $("#zammad-chat"),
      });

      // Monkey patch Zammad.

      // This send the user informations to zammad.
      chat.onConnectionEstablished = (data) => {
        const isNew = Boolean(data.session_id);
        ZammadChat.prototype.onConnectionEstablished.call(chat, data);
        if (isNew) {
          if (young) {
            const info = [
              `🧑‍🎓 <a href="${adminURL}/volontaire/${young._id}">${young.firstName + " " + young.lastName}</a> ${young.email}`,
              `🔋 Statut : <b>${young.status}</b> (phase1: ${young.statusPhase1} - phase2: ${young.statusPhase2} - phase3: ${young.statusPhase2} )`,
            ];
            api
              .post("/support-center/ticket", {
                subject: `${young.firstName} ${young.lastName} - ${new Date().toLocaleString()}`,
                type: "💬 Chat",
                message: "Chat initialisé", // "Chat initialisé", // "https://support.selego.co/#customer_chat/session/" + chat.sessionId,
              })
              .then((res) => {
                chat.waitingForTicketAdditionalInformation = true;
                chat.ticketId = res.data.id;
                sendMessage(chat, [...info, `📝 Ticket : https://support.selego.co/#ticket/zoom/${res.data.id}`]);
              })
              .catch((e) => {
                sendMessage(chat, [...info, `Échec de la création du ticket, il faut le créer manuellement`]);
              });
          } else {
            sendMessage(chat, [`🧑‍🎓 Non connecté.`]);
          }
        }
      };

      // This is needed to ensure users never sees their informations when they refresh page.
      chat.onReopenSession = (data) => {
        data.session = (data.session || []).filter((message) => message.content.startsWith("INFO USER: ") === false && message.content.startsWith("🧑‍🎓 ") === false);
        ZammadChat.prototype.onReopenSession.call(chat, data);
      };

      // When the first response is received, we got the internal chat ID,
      // so we can update the ticket that was created on session open.
      chat.receiveMessage = function (data) {
        if (chat.waitingForTicketAdditionalInformation && data?.message?.chat_session_id) {
          chat.waitingForTicketAdditionalInformation = false;
          api
            .put(`/support-center/ticket/${chat.ticketId}`, {
              message: `https://support.selego.co/#customer_chat/session/${data.message.chat_session_id}`,
            })
            .then((res) => {
              console.log("Ticket updated", res);
            });
        }
        ZammadChat.prototype.receiveMessage.call(chat, data);
      };

      // End of monkey patch
    });
  }, []);

  return null;
}
