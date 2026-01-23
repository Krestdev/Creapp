import { RequestModelT } from "@/types/types";

export const approbatorRequests = (
  requests: Array<RequestModelT>,
  userId?: number,
): Array<RequestModelT> => {
  if (!userId) return [];
  return requests.filter((r) => {
    const myRank = r.validators.find((u) => u.userId === userId)?.rank;
    if (!myRank) {
      return false;
    }
    if (r.state === "cancel") {
      return false;
    }
    if (myRank === 1) {
      return true;
    }
    if (r.state === "validated" || r.state === "rejected") {
      return true;
    }
    return r.validators.find((v) => v.rank === myRank - 1)?.validated === true;
  });
};

export const pendingApprobation = (
  requests: Array<RequestModelT>,
  userId?: number,
): Array<RequestModelT> => {
  if (!userId) return [];
  return requests.filter((b) => {
    b.state === "pending" && b.validators.find(v=> v.userId === userId)?.validated === false
  });
};

export const decidedRequests = (requests:Array<RequestModelT>, userId?:number):Array<RequestModelT> => {
    return requests.filter(b=> b.validators.find(v=> v.userId === userId)?.validated === true);
}
