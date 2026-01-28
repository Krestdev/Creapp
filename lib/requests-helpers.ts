import { RequestModelT } from "@/types/types";

export const approbatorRequests = (
  requests: Array<RequestModelT>,
  userId?: number,
): Array<RequestModelT> => {
  if (!userId) return [];
  const res = requests.filter((r) => {
    const myRank = r.validators.find((u) => u.userId === userId)?.rank;
    if (!myRank) {
      return false;
    }
    if (r.state === "cancel" || r.type === "speciaux") {
      return false;
    }
    if (myRank === 1) {
      return true;
    }
    if (r.state === "validated" || r.state === "rejected" || r.state === "store") {
      return true;
    }
    return r.validators.find((v) => v.rank === myRank - 1)?.validated === true;
  });
  return res;
};
