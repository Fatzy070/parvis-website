import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button, PageSkeleton, ErrorState } from "../components/UI";
import { Check, Download, ExternalLink } from "lucide-react";
import { api } from "../api/client";

export default function CertificateView() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCertificate() {
      try {
        const response = await api(`/my-learning/certificates/${id}/verify`);
        setCert(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCertificate();
  }, [id]);

  if (loading) return <PageSkeleton />;
  
  if (error) {
    return (
      <div className="container section">
        <ErrorState error={error} />
      </div>
    );
  }

  const downloadUrl = `/api/my-learning/certificates/${id}?download=true`;

  return (
    <div className="container section">
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#dcfce7',
            color: '#166534',
            marginBottom: '1rem'
          }}>
            <Check size={32} />
          </div>
          <h1>Certificate Verified</h1>
          <p className="text-secondary">
            This Certificate of Completion is valid and was issued by LearnHub.
          </p>
        </div>

        <div className="card" style={{ padding: '3rem', textAlign: 'left', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <p className="text-secondary" style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em' }}>Recipient</p>
            <h2 style={{ margin: '0.5rem 0' }}>{cert.studentName}</h2>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <p className="text-secondary" style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em' }}>Course</p>
            <h3 style={{ margin: '0.5rem 0' }}>{cert.courseTitle}</h3>
            {cert.totalLessons > 0 && (
              <p className="text-secondary" style={{ margin: 0 }}>Completed {cert.completedLessons} of {cert.totalLessons} lessons</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <p className="text-secondary" style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em' }}>Issue Date</p>
              <p style={{ margin: '0.5rem 0', fontWeight: '500' }}>{new Date(cert.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-secondary" style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.05em' }}>Verification ID</p>
              <p style={{ margin: '0.5rem 0', fontWeight: '500', fontFamily: 'monospace' }}>{cert.certificateId}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href={downloadUrl} className="button">
            <Download size={18} />
            Download PDF
          </a>
          <Link to="/courses" className="button secondary">
            Explore Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
