import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Syringe, Calendar, Baby, UserCog, Hospital, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Certificate {
  child: { name: string; dateOfBirth: string };
  vaccine: { name: string };
  doctor: { name: string };
  hospital: { name: string; address: string };
  appointmentDate: string;
  certificateUrl?: string | null;
}

const Certificate = () => {
  const { appointmentId } = useParams();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyCertificate();
  }, [appointmentId]);

  const verifyCertificate = async () => {
    try {
      const { data } = await axiosInstance.get(`/certificates/verify/${appointmentId}`);
      if (data?.appointment) {
        setCertificate(data.appointment);
        setIsValid(Boolean(data.verified));
      } else {
        setCertificate(null);
        setIsValid(false);
        toast.error('Certificate data is missing from the response');
      }
    } catch (error) {
      setIsValid(false);
      setCertificate(null);
      toast.error('Certificate verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const downloadUrl = certificate?.certificateUrl;
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Certificate not available');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Syringe className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">DigiVax</h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Vaccination Certificate</h2>
        </div>

        {isValid && certificate ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-success/10 border border-success/20">
              <CheckCircle2 className="h-6 w-6 text-success" />
              <p className="font-semibold text-success">Certificate Verified</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <Baby className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Child</p>
                  <p className="font-semibold text-foreground">{certificate.child.name}</p>
                  <p className="text-sm text-muted-foreground">
                    DOB: {new Date(certificate.child.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <Syringe className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Vaccine</p>
                  <p className="font-semibold text-foreground">{certificate.vaccine.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <UserCog className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Administered by</p>
                  <p className="font-semibold text-foreground">Dr. {certificate.doctor.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <Hospital className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Hospital</p>
                  <p className="font-semibold text-foreground">{certificate.hospital.name}</p>
                  <p className="text-sm text-muted-foreground">{certificate.hospital.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold text-foreground">
                    {new Date(certificate.appointmentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleDownload} className="w-full" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <XCircle className="h-6 w-6 text-destructive" />
              <p className="font-semibold text-destructive">Certificate Not Found</p>
            </div>
            <p className="text-muted-foreground">
              This certificate could not be verified or does not exist.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Certificate;
