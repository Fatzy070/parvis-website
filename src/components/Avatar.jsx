import { UserRound } from "lucide-react";
export default function Avatar({ user, className = "avatar" }) {
  const image = user?.avatarUrl || user?.image;
  return (
    <span className={className}>
      {image ? (
        <img src={image} alt="" />
      ) : (
        <UserRound
          size={className === "profile-initials" ? 36 : 20}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
