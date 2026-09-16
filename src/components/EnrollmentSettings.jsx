import { useState } from "react";
import { useUnenroll } from "../queries";
import { Button, FormError } from "./UI";
export default function EnrollmentSettings({ enrollment }) {
  const remove = useUnenroll(enrollment.courseId);
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="enrollment-setting">
      <div>
        <strong>{enrollment.course.title}</strong>
        <p className="muted">
          {confirm
            ? "Remove this enrollment and its saved progress?"
            : `${enrollment.progress}% complete`}
        </p>
        <FormError error={remove.error} />
      </div>
      <div className="actions">
        {confirm && (
          <Button className="secondary" onClick={() => setConfirm(false)}>
            Keep course
          </Button>
        )}
        <Button
          className="secondary danger"
          pending={remove.isPending}
          onClick={() => (confirm ? remove.mutate() : setConfirm(true))}
        >
          {confirm ? "Remove enrollment" : "Unenroll"}
        </Button>
      </div>
    </div>
  );
}
