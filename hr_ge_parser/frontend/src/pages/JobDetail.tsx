import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Home,
  GraduationCap,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, Badge, Button, Spinner } from '@/components/ui';
import { useJob } from '@/hooks/useJobs';
import { formatDate, formatSalary } from '@/utils/formatters';
import { ROUTES } from '@/utils/constants';

// ============================================================
// COMPONENT
// ============================================================

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useJob(Number(id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Job not found</p>
        <Link to={ROUTES.JOBS} className="mt-4 inline-block">
          <Button variant="secondary">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to={ROUTES.JOBS} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 dark:text-gray-400 dark:hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <PageHeader
        title={job.title}
        description={job.company?.name || 'Unknown Company'}
        actions={
          <div className="flex gap-2">
            <Badge variant={job.is_expired ? 'danger' : 'success'}>
              {job.is_expired ? 'Expired' : 'Active'}
            </Badge>
            {job.is_work_from_home && <Badge variant="info">Remote</Badge>}
            {job.is_suitable_for_student && <Badge variant="info">Student</Badge>}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Job Description">
            {job.description ? (
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No description available</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Job Details">
            <div className="space-y-4">
              {(job.salary_from || job.salary_to) && (
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Salary</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatSalary(job.salary_from, job.salary_to, job.salary_currency)}
                    </p>
                  </div>
                </div>
              )}

              {job.company && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                    <p className="font-medium text-gray-900 dark:text-white">{job.company.name}</p>
                  </div>
                </div>
              )}

              {job.addresses && job.addresses.length > 0 && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {job.addresses.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {job.publish_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(job.publish_date)}
                    </p>
                  </div>
                </div>
              )}

              {job.deadline_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Deadline</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(job.deadline_date)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Home className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Remote Work</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {job.is_work_from_home ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Suitable for Students</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {job.is_suitable_for_student ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {!job.hide_contact_person && (job.contact_email || job.contact_phone) && (
            <Card title="Contact">
              <div className="space-y-3">
                {job.contact_name && (
                  <p className="font-medium text-gray-900 dark:text-white">{job.contact_name}</p>
                )}
                {job.contact_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${job.contact_email}`} className="text-primary-600 hover:underline">
                      {job.contact_email}
                    </a>
                  </div>
                )}
                {job.contact_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${job.contact_phone}`} className="text-primary-600 hover:underline">
                      {job.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card title="External Link">
            <a
              href={`https://hr.ge/announcement/${job.external_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-600 hover:underline"
            >
              <Globe className="h-4 w-4" />
              View on HR.GE
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
