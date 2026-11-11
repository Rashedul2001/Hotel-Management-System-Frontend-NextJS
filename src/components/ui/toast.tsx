import { BiCheckCircle } from "react-icons/bi";
import { FiAlertCircle, FiInfo } from "react-icons/fi";
import { toast } from "sonner";

export const successToast = (title = "Success", message?: string) => {
    const finalTitle = message !== undefined ? title : "Success";
    const finalMessage = message !== undefined ? message : (title === "Success" ? "Enjoy your stay!" : title);
    toast.success(
        <div className="flex flex-col gap-1">
            <span className="font-semibold text-white">{finalTitle}</span>
            <span className="text-[#797777] text-xs">{finalMessage}</span>
        </div>,
        { icon: <BiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> }
    );
};

export const errorToast = (title = "Error", message?: string) => {
    const finalTitle = message !== undefined ? title : "Error";
    const finalMessage = message !== undefined ? message : (title === "Error" ? "An error occurred. Please try again." : title);
    toast.error(
        <div className="flex flex-col gap-1">
            <span className="font-semibold text-white">{finalTitle}</span>
            <span className="text-[#b1abab] text-xs">{finalMessage}</span>
        </div>,
        { icon: <FiAlertCircle className="w-5 h-5 text-rose-600 shrink-0" /> }
    );
};

export const infoToast = (title = "Info", message?: string) => {
    const finalTitle = message !== undefined ? title : "Info";
    const finalMessage = message !== undefined ? message : (title === "Info" ? "Here is some information for you." : title);
    toast.info(
        <div className="flex flex-col gap-1">
            <span className="font-semibold text-white">{finalTitle}</span>
            <span className="text-[#b1abab] text-xs">{finalMessage}</span>
        </div>,
        { icon: <FiInfo className="w-5 h-5 text-blue-600 shrink-0" /> }
    );
};
