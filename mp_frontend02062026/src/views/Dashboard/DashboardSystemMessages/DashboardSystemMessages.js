import React, { useState, useContext, useEffect } from "react";
import PopupMessage from "../popupModal";
import Banner from "../Components/Banner";
import { CommonDataContext } from "../../../common/contexts/CommonDataContext";
import APIS from "../../../common/hooks/UseApiCalls";

const DashboardSystemMessages = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(true);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const { popupMessages, bannerMessages, allSystemMessages, setAllSystemMessages } = useContext(CommonDataContext);

  const updateMsgReadStatus = async (messageId) => {
    const date = new Date();
    const formattedDate = date.toISOString();

    await APIS.UpdateSystemMessageReadStatus({
      messageId: messageId,
      readDate: formattedDate
    }).then((res) => {
      if(res?.data?.message == "Read Status Updated Successfully"){
        const updatedAllSystemMessages = allSystemMessages?.filter(msg => msg.id !== messageId)
        setAllSystemMessages(updatedAllSystemMessages)
      }
    }).catch((err) => {
      console.error("Failed to update message status:", err);
    });
  }

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    updateMsgReadStatus(popupMessages[currentMessageIndex].id);
    setTimeout(() => {
      if (currentMessageIndex < popupMessages.length - 1) {
        setCurrentMessageIndex(currentMessageIndex + 1);
        setIsPopupOpen(true);
      }
    }, 300);
  };

  // Use useEffect to detect changes in popupMessages
  useEffect(() => {
    if (popupMessages.length > 0) {
      setCurrentMessageIndex(0);
      setIsPopupOpen(true);
    }
  }, [popupMessages]);

  return (
    <>
      {popupMessages.length > 0 && (
        <PopupMessage
          key={popupMessages[currentMessageIndex]?.id}
          open={isPopupOpen}
          handleclose={handlePopupClose}
          subject={popupMessages[currentMessageIndex]?.subject}
          content={popupMessages[currentMessageIndex]?.content}
          availableActions={popupMessages[currentMessageIndex]?.availableActions || []}
        />
      )}
      {bannerMessages.length > 0 && (
        <>
          {bannerMessages.map((msg) => (
            <Banner key={msg.id} subject={msg.subject} content={msg.content} />
          ))}
        </>
      )}
    </>
  );
};

export default DashboardSystemMessages;