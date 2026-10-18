package resumetemplates

import (
	"backend/lib/utils"
	"backend/sqlc_gen"
	"time"
)

// ConvertResumeToLatex_RESEARCHER converts resume data, user info, and profile info to a LaTeX document
// using an academic research-focused layout appropriate for researchers and academics
func ConvertResumeToLatex_RESEARCHER(language string, resume_data utils.InputResumeData, user sqlc_gen.GetUserByIdRow, profile sqlc_gen.GetProfileByUserIdRow) (string, error) {
	// Create a map to hold all the data for the template
	template_data := make(map[string]any)

	// Add user and profile data
	template_data["user"] = user
	template_data["profile"] = profile

	// Format and add resume sections
	template_data["education"] = format_education_section(resume_data.Educations)
	template_data["experience"] = format_experience_section(resume_data.Experiences)
	template_data["skills"] = format_skills_section(resume_data.Skills)
	template_data["languages"] = format_languages_section(resume_data.Skills)
	template_data["projects"] = format_projects_section(resume_data.Projects)
	template_data["certificates"] = format_certificates_section(resume_data.Certificates)

	// Get current date for "last updated" field
	current_time := time.Now()
	template_data["last_updated_month"] = current_time.Format("January")
	template_data["last_updated_year"] = current_time.Format("2006")
	template_data["current_date"] = current_time.Format("January 2, 2006")

	// Execute the template
	if language == "fr" {
		return render_latex_document(template_data, "columns-executive", FR_RESEARCHER_TEMPLATE)
	} else {
		return render_latex_document(template_data, "columns-executive", EN_RESEARCHER_TEMPLATE)
	}
}

// LaTeX researcher template
const EN_RESEARCHER_TEMPLATE = `\documentclass[12pt]{article}
\usepackage{listings}
\usepackage{fixltx2e}
\MakeRobust{\overrightarrow}
\usepackage{multicol}
\usepackage[T1]{fontenc} 
\usepackage[letterpaper, total={7in, 8.5in}]{geometry}
\usepackage{fancyhdr}
\usepackage{hyperref}
\pagestyle{fancy}

\rhead{<<escape_latex .user.FullName>>}

% Hyperlink setup
\hypersetup{
    pdftitle={<<escape_latex .user.FullName>> - Academic CV},
    pdfauthor={<<escape_latex .user.FullName>>}
}

\begin{document}
\thispagestyle{empty}

% Header with name
\begin{center}
    \textsc{\textbf{\LARGE{<<escape_latex .user.FullName>>}}}
\end{center}
\rule{\textwidth}{1pt}

% Contact information
\begin{multicols}{2}
    \flushleft{
        \textsf{<<if .profile.Description>><<escape_latex .profile.Description>><<end>>}
    } 
    \columnbreak
    \flushright{
        \textsf{
            <<if .user.Phone>>Phone: <<escape_latex .user.Phone>><<end>><<if .user.Email>>\\E-mail: {<<escape_latex .user.Email>>}<<end>><<if .user.Location>>\\Location: <<escape_latex .user.Location>><<end>><<if .profile.Website>>\\\href{<<.profile.Website>>}{<<escape_latex .profile.Website>>}<<end>><<if .profile.Linkedin>>\\\href{<<.profile.Linkedin>>}{<<escape_latex .profile.Linkedin>>}<<end>>}}
\end{multicols}

% Education section
<<if .education>>
\vspace{2pt}
\begin{center}\textrm{\textbf{\large{\underline{Educations}}}}\end{center}
\flushleft{
    <<range .education>>
		\textsf{\textbf{<<escape_latex .degree>>} <<escape_latex .start_date>><<if .end_date>> - <<escape_latex .end_date>><<end>>\\ <<if .location>>\textsf{<<escape_latex .location>>}<<end>> \textit{<<escape_latex .school>>}\\<<if .description>><<if .is_raw_latex>><<.description>><<else>><<range $index, $bullet := (split .description "\n")>><<escape_latex $bullet>><<end>><<end>><<end>>}%
	<<end>>
\vspace{2pt}}
<<end>>


% Experience section
<<if .experience>>
\vspace{2pt}
\begin{center}\textrm{\textbf{\large{\underline{Experiences}}}}\end{center}
\flushleft{
    <<range .experience>>
		\textsf{\textbf{<<escape_latex .title>>} <<escape_latex .start_date>><<if .end_date>> - <<escape_latex .end_date>><<end>>\\ <<if .location>>\textsf{<<escape_latex .location>>}<<end>> \textit{<<escape_latex .company>>}\\<<if .description>><<if .is_raw_latex>><<.description>><<else>><<range $index, $bullet := (split .description "\n")>><<escape_latex $bullet>><<end>><<end>><<end>>}%
	<<end>>
\vspace{2pt}}
<<end>>


% Projects section
<<if .projects>>
\vspace{2pt}
\begin{center}\textrm{\textbf{\large{\underline{Projects}}}}\end{center}
\flushleft{
    <<range .projects>>
		\textsf{\textbf{<<escape_latex .title>>} <<escape_latex .start_date>><<if .end_date>> - <<escape_latex .end_date>><<end>>\\ <<if .location>>\textsf{<<escape_latex .location>>}<<end>> \textit{<<escape_latex .subtitle>>}\\<<if .description>><<if .is_raw_latex>><<.description>><<else>><<range $index, $bullet := (split .description "\n")>><<escape_latex $bullet>><<end>><<end>><<end>>}%
	<<end>>
\vspace{2pt}}
<<end>>

% Certifications section
<<if .certificates>>
\vspace{2pt}
\begin{center}\textrm{\textbf{\large{\underline{Certifications}}}}\end{center}
\flushleft{
    <<range .certificates>>
		\textsf{\textbf{<<escape_latex .name>>} <<escape_latex .granted_date>><<if .location>>\\\textsf{<<escape_latex .location>>}<<end>><<if .issuer>> \textit{<<escape_latex .issuer>>}<<end>><<if .description>>\\<<if .is_raw_latex>><<.description>><<else>><<range $index, $bullet := (split .description "\n")>><<escape_latex $bullet>><<end>><<end>><<end>>}%
	<<end>>
	\vspace{2pt}}
<<end>>

% Skills section
<<if .skills>>
\vspace{2pt}
\begin{center}\textrm{\textbf{\large{\underline{Skills}}}}\end{center}
\flushleft{
    \textsf\bfseries{
<<range $index, $skill := .skills>>
\textit{\textbf{<<escape_latex $skill.name>>}} <<if $skill.description>>: <<escape_latex $skill.description>>\\<<end>>
<<end>>}}
\vspace{2pt}
<<end>>

% Languages section
<<if .languages>>
\vspace{2pt}
\begin{center}\textrm{\textbf{\large{\underline{Languages}}}}\end{center}
\flushleft{
    \textsf\bfseries{
<<range $index, $language := .languages>>
\textit{\textbf{<<escape_latex $language.name>>}} <<if $language.level>>: <<escape_latex $language.level>>\\<<end>>
<<end>>}}
\vspace{2pt}
<<end>>

\end{document}`

const FR_RESEARCHER_TEMPLATE = `\documentclass[12pt]{article}
\usepackage{listings}
\usepackage{fixltx2e}
\MakeRobust{\overrightarrow}
\usepackage{multicol}
\usepackage[T1]{fontenc} 
\usepackage[letterpaper, total={7in, 8.5in}]{geometry}
\usepackage{fancyhdr}
\usepackage{hyperref}
\pagestyle{fancy}

\rhead{<<escape_latex .user.FullName>>}

% Hyperlink setup
\hypersetup{
    pdftitle={<<escape_latex .user.FullName>> - Academic CV},
    pdfauthor={<<escape_latex .user.FullName>>}
}

\begin{document}
\thispagestyle{empty}

% Header with name
\begin{center}
    \textsc{\textbf{\LARGE{<<escape_latex .user.FullName>>}}}
\end{center}
\rule{\textwidth}{1pt}

% Contact information
\begin{multicols}{2}
    \flushleft{
        \textsf{<<if .profile.Description>><<escape_latex .profile.Description>><<end>>}
    } 
    \columnbreak
    \flushright{
        \textsf{
            <<if .user.Phone>>Phone: <<escape_latex .user.Phone>><<end>><<if .user.Email>>\\E-mail: {<<escape_latex .user.Email>>}<<end>><<if .user.Location>>\\Location: <<escape_latex .user.Location>><<end>><<if .profile.Website>>\\\href{<<.profile.Website>>}{<<escape_latex .profile.Website>>}<<end>><<if .profile.Linkedin>>\\\href{<<.profile.Linkedin>>}{<<escape_latex .profile.Linkedin>>}<<end>>}}
\end{multicols}

% Education section
<<if .education>>
\vspace{2pt}
\begin{center}\textrm{\textbf{\large{\underline{Éducations}}}}\end{center}
\flushleft{
    <<range .education>>
		\textsf{\textbf{<<escape_latex .degree>>} <<escape_latex .start_date>><<if .end_date>> - <<escape_latex .end_date>><<end>>\\ <<if .location>>\textsf{<<escape_latex .location>>}<<end>> \textit{<<escape_latex .school>>}\\<<if .description>><<if .is_raw_latex>><<.description>><<else>><<range $index, $bullet := (split .description "\n")>><<escape_latex $bullet>><<end>><<end>><<end>>}%
	<<end>>
\vspace{2pt}}
<<end>>


% Experience section
<<if .experience>>
\vspace{2pt}
\begin{center}\textrm{\textbf{\large{\underline{Experiences}}}}\end{center}
\flushleft{
    <<range .experience>>
		\textsf{\textbf{<<escape_latex .title>>} <<escape_latex .start_date>><<if .end_date>> - <<escape_latex .end_date>><<end>>\\ <<if .location>>\textsf{<<escape_latex .location>>}<<end>> \textit{<<escape_latex .company>>}\\<<if .description>><<if .is_raw_latex>><<.description>><<else>><<range $index, $bullet := (split .description "\n")>><<escape_latex $bullet>><<end>><<end>><<end>>}%
	<<end>>
\vspace{2pt}}
<<end>>


% Projects section
<<if .projects>>
\vspace{2pt}
\begin{center}\textrm{\textbf{\large{\underline{Projets}}}}\end{center}
\flushleft{
    <<range .projects>>
		\textsf{\textbf{<<escape_latex .title>>} <<escape_latex .start_date>><<if .end_date>> - <<escape_latex .end_date>><<end>>\\ <<if .location>>\textsf{<<escape_latex .location>>}<<end>> \textit{<<escape_latex .subtitle>>}\\<<if .description>><<if .is_raw_latex>><<.description>><<else>><<range $index, $bullet := (split .description "\n")>><<escape_latex $bullet>><<end>><<end>><<end>>}%
	<<end>>
\vspace{2pt}}
<<end>>

% Certifications section
<<if .certificates>>
\vspace{2pt}
\begin{center}\textrm{\textbf{\large{\underline{Certificats}}}}\end{center}
\flushleft{
    <<range .certificates>>
		\textsf{\textbf{<<escape_latex .name>>} <<escape_latex .granted_date>><<if .location>>\\\textsf{<<escape_latex .location>>}<<end>><<if .issuer>> \textit{<<escape_latex .issuer>>}<<end>><<if .description>>\\<<if .is_raw_latex>><<.description>><<else>><<range $index, $bullet := (split .description "\n")>><<escape_latex $bullet>><<end>><<end>><<end>>}%
	<<end>>
	\vspace{2pt}}
<<end>>

% Skills section
<<if .skills>>
\vspace{2pt}
\begin{center}\textrm{\textbf{\large{\underline{Compétences}}}}\end{center}
\flushleft{
    \textsf\bfseries{
<<range $index, $skill := .skills>>
\textit{\textbf{<<escape_latex $skill.name>>}} <<if $skill.description>>: <<escape_latex $skill.description>>\\<<end>>
<<end>>}}
\vspace{2pt}
<<end>>

% Languages section
<<if .languages>>
\vspace{2pt}
\begin{center}\textrm{\textbf{\large{\underline{Langages}}}}\end{center}
\flushleft{
    \textsf\bfseries{
<<range $index, $language := .languages>>
\textit{\textbf{<<escape_latex $language.name>>}} <<if $language.level>>: <<escape_latex $language.level>>\\<<end>>
<<end>>}}
\vspace{2pt}
<<end>>

\end{document}`
