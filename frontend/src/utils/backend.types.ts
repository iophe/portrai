// Base interfaces
interface Experience {
    experience_id: number;
    company_name: string;
    job_title: string;
    location: string;
    start_date: string;
    optional_end_date: string;
    is_current: boolean;
    description: string;
    priority: number;
    tags: string[];
    notes: Record<string, any>[];
}

interface Education {
    education_id: number;
    school: string;
    degree: string;
    location: string;
    start_date: string;
    optional_end_date: string;
    is_current: boolean;
    description: string;
    priority: number;
    tags: string[];
    notes: Record<string, any>[];
}

interface Skill {
    skill_id: number;
    skill_name: string;
    optional_skill_type: string;
    optional_skill_level: string;
    description: string;
    priority: number;
    tags: string[];
    notes: Record<string, any>[];
}

interface Certificate {
    certificate_id: number;
    certificate_name: string;
    optional_issuer: string;
    optional_location: string;
    optional_granted_date: string;
    description: string;
    priority: number;
    tags: string[];
    notes: Record<string, any>[];
}

interface Project {
    project_id: number;
    project_title: string;
    optional_project_subtitle: string;
    start_date: string;
    optional_end_date: string;
    is_current: boolean;
    description: string;
    priority: number;
    tags: string[];
    notes: Record<string, any>[];
}

// Response interfaces for single items
interface ExperienceResponse {
    experience: Experience;
}

interface EducationResponse {
    education: Education;
}

interface SkillResponse {
    skill: Skill;
}

interface CertificateResponse {
    certificate: Certificate;
}

interface ProjectResponse {
    project: Project;
}

// Response interfaces for collections
interface ExperiencesResponse {
    experiences: Experience[];
}

interface EducationsResponse {
    educations: Education[];
}

interface SkillsResponse {
    skills: Skill[];
}

interface CertificatesResponse {
    certificates: Certificate[];
}

interface ProjectsResponse {
    projects: Project[];
}