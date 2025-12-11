import CreateUserForm from "@/components/utilisateurs/create-user";

const CreateUser = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>Créer un utilisateur</h2>
        </div>
        <CreateUserForm />
      </div>
    </div>
  );
};

export default CreateUser;
