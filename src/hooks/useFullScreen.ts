import React from "react";
import screenfull, { Screenfull } from "screenfull";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setIsFullscreen } from "../store/reducers/uiReducer";

const useFullScreen = () => {
  const dispatch = useAppDispatch();
  const isFullScreen = useAppSelector((state) => state.ui.isFullscreen);

  React.useEffect(() => {
    const sfull = screenfull as Screenfull;
    if (sfull.isEnabled) {
      sfull.on("change", () => {
        dispatch(setIsFullscreen(sfull.isFullscreen));
      });
    }
  }, [dispatch]);

  React.useEffect(() => {
    if (screenfull.isEnabled) {
      if (isFullScreen) {
        (screenfull as Screenfull).request();
      } else {
        (screenfull as Screenfull).exit();
      }
    }
  }, [isFullScreen]);
};

export default useFullScreen;
