import ConfirmationDialog from "Components/ConfirmationDialog";
import { UserContext } from "Contexts/UserContext";
import { VendorContext } from "Contexts/VendorContext";
import { SocketRegisterInput, WebSocketContext } from "Contexts/WebSocket";
import { useContext } from "react";
import { ConfirmationScreenProps } from "types/types";

function Confirmation({ navigation, route }: ConfirmationScreenProps) {
  const vendorContext = useContext(VendorContext);
  const userContext = useContext(UserContext);
  const webSocket = useContext(WebSocketContext);
  const { title, description, confirmNavigateTo, confrimNavParams, isSwitching, switchingTo } = route.params;

  if(!userContext){
    throw new Error("Component must be under User Provider!!")
  } 

  if(!vendorContext){
    throw new Error("Component must be under Vendor Provider!!")
  } 

  if(!webSocket){
    throw new Error("Component must be under Websocket Provider!!");
  }

  const { vendor } = vendorContext;
  const { user } = userContext;
  const { sendMessage } = webSocket;

  const onConfirm = () => {
    if (confrimNavParams) {
      navigation.reset({
        index: 0,
        routes: [{ name: confirmNavigateTo, params: { ...confrimNavParams } }],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: confirmNavigateTo }],
      });
    }

    if(isSwitching && !switchingTo){
      const message: SocketRegisterInput = {
        senderId: switchingTo == "CLIENT"? vendor.id : user._id,
        senderType: switchingTo == "CLIENT"? "VENDOR" : "CLIENT",
        inputType: "REGISTER"
      }

      sendMessage(message);
    }
  };

  const onCancel = () => {
    navigation.goBack();
  };

  const ConfirmationDialogProps = {
    title,
    description,
    onConfirm,
    onCancel,
  };

  return <ConfirmationDialog {...ConfirmationDialogProps} />;
}

export default Confirmation;
