// import { MessageData } from "@/interfaces/meseage_related/messageInterFace";

// export function prepareMessageForRedux(msg: MessageData): MessageData {
//   if (!msg.hasFiles || !msg.files?.length) return msg;

//   const safeFiles = msg.files.map((file) => {
//     const blob = new Blob([file.fileData], { type: file.fileType });
//     const blobUrl = URL.createObjectURL(blob);
//     return {
//       fileName: file.fileName,
//       fileType: file.fileType,
//       fileData: blobUrl, // ✅ Store only the blob URL
//     };
//   });

//   return {
//     ...msg,
//     files: safeFiles,
//   };
// }
