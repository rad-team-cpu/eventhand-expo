import ConfirmationDialog from "Components/ConfirmationDialog";
import { ConfirmationScreenProps } from "types/types";

function Confirmation({ navigation, route }: ConfirmationScreenProps) {
  const { title, description, confirmNavigateTo, confrimNavParams } =
    route.params;

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
