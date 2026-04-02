import { RequestModelT, User } from "@/types/types";
import React from "react";

interface Props {
  user: User;
  requests: Array<RequestModelT>;
}

function ProfilePage({ user, requests }: Props) {
  return <div>ProfilePage</div>;
}

export default ProfilePage;
