import CallOverLay from "@/utils/callRelated/CallOverLay";

const Call = (props: {
  mobile: string;
  currentMobile: string;
}) => {
  return (
    <CallOverLay mobile={props.mobile} currentMobile={props.currentMobile} />
  );
};

export default Call;
