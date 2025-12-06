import { ProjectCreateForm } from "@/components/forms/create-project";

const CreateProject = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <div className="flex justify-between">
          <h2>Créer un utilisateur</h2>
        </div>
        <ProjectCreateForm />
      </div>
    </div>
  );
};

export default CreateProject;
