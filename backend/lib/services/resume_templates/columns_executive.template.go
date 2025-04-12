package resumetemplates

import (
	"backend/lib/utils"
	"backend/sqlc_gen"
	"time"
)

// ConvertResumeToLatex_COLUMNS_EXECUTIVE converts resume data, user info, and profile info to a LaTeX document
// using a two-column layout design
func ConvertResumeToLatex_COLUMNS_EXECUTIVE(resume_data utils.InputResumeData, user sqlc_gen.GetUserByIdRow, profile sqlc_gen.GetProfileByUserIdRow) (string, error) {
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

	// Execute the template
	return render_latex_document(template_data, "columns-executive", columns_executive_template)
}

// LaTeX columns executive template
const columns_executive_template = `\documentclass[12pt]{article}
\usepackage[english]{babel}
\usepackage{cmbright}
\usepackage{enumitem}
\usepackage{fancyhdr}
\usepackage{fontawesome5}
\usepackage{geometry}
\usepackage{hyperref}
\usepackage[sf]{libertine}
\usepackage{microtype}
\usepackage{paracol}
\usepackage{supertabular}
\usepackage{titlesec}
\hypersetup{colorlinks, urlcolor=black, linkcolor=black}

% Geometry
\geometry{hmargin=1.75cm, vmargin=2.5cm}
\columnratio{0.65, 0.35}
\setlength\columnsep{0.05\textwidth}
\setlength\parindent{0pt}
\setlength{\smallskipamount}{8pt plus 3pt minus 3pt}
\setlength{\medskipamount}{16pt plus 6pt minus 6pt}
\setlength{\bigskipamount}{24pt plus 8pt minus 8pt}

% Style
\pagestyle{empty}
\titleformat{\section}{\scshape\LARGE\raggedright}{}{0em}{}[\titlerule]
\titlespacing{\section}{0pt}{\bigskipamount}{\smallskipamount}
\newcommand{\heading}[2]{\centering{\sffamily\Huge #1}\\\smallskip{\large{#2}}}
\newcommand{\entry}[4]{{\textbf{#1}} \hfill #3 \\ #2 \hfill #4}
\newcommand{\tableentry}[3]{\textsc{#1} & #2\expandafter\ifstrequal\expandafter{#3}{}{\\}{\\[6pt]}}

\begin{document}

\vspace*{\fill}

\begin{paracol}{2}

% Name & Profile
\heading{<<escape_latex .user.FullName>>}{<<if .profile.Description>><<range $index, $line := (split .profile.Description "\n")>> <<escape_latex $line>><<end>><<end>>}

\switchcolumn

% Contact Information
\vspace{0.01\textheight}
\begin{supertabular}{ll}
  <<if .user.Phone>>\footnotesize\faPhone & <<escape_latex .user.Phone>> \\<<end>>
  <<if .user.Email>>\footnotesize\faEnvelope & \href{mailto:<<.user.Email>>}{<<escape_latex .user.Email>>} \\<<end>>
  <<if .user.Location>>\footnotesize\faMapMarker* & <<escape_latex .user.Location>> \\<<end>>
  <<if .profile.Website>>\footnotesize\faLink & \href{<<.profile.Website>>}{<<escape_latex .profile.Website>>} \\<<end>>
  <<if .profile.Linkedin>>\footnotesize\faLinkedin & \href{<<.profile.Linkedin>>}{<<escape_latex .profile.Linkedin>>} \\<<end>>
\end{supertabular}

\bigskip
\switchcolumn*

<<if .experience>>
\section{experience}

<<range .experience>>
\entry{<<escape_latex .company>>}{<<escape_latex .title>>}{<<if .location>><<escape_latex .location>><<end>>}{<<escape_latex .start_date>><<if .end_date>> -- <<escape_latex .end_date>><<end>>}
<<if .description>>
<<if .is_raw_latex>>
<<.description>>
<<else>>
\begin{itemize}[noitemsep,leftmargin=3.5mm,rightmargin=0mm,topsep=6pt]
  <<range $index, $bullet := (split .description "\n")>>
  \item <<escape_latex $bullet>>
  <<end>>
\end{itemize}
<<end>>
<<end>>

\medskip
<<end>>
<<end>>

<<if .education>>
\section{education}

<<range .education>>
\entry{<<escape_latex .school>>}{<<escape_latex .degree>>}{<<if .location>><<escape_latex .location>><<end>>}{<<escape_latex .start_date>><<if .end_date>> -- <<escape_latex .end_date>><<end>>}
<<if .description>>
<<if .is_raw_latex>>
<<.description>>
<<else>>
\begin{itemize}[noitemsep,leftmargin=3.5mm,rightmargin=0mm,topsep=6pt]
  <<range $index, $bullet := (split .description "\n")>>
  \item <<escape_latex $bullet>>
  <<end>>
\end{itemize}
<<end>>
<<end>>

\medskip
<<end>>
<<end>>

<<if .projects>>
\section{projects}

<<range .projects>>
\entry{<<escape_latex .title>>}{<<if .subtitle>><<escape_latex .subtitle>><<end>>}{<<if .date_display>><<escape_latex .date_display>><<end>>}{}
<<if .description>>
<<if .is_raw_latex>>
<<.description>>
<<else>>
\begin{itemize}[noitemsep,leftmargin=3.5mm,rightmargin=0mm,topsep=6pt]
  <<range $index, $bullet := (split .description "\n")>>
  \item <<escape_latex $bullet>>
  <<end>>
\end{itemize}
<<end>>
<<end>>

\medskip
<<end>>
<<end>>

\switchcolumn


<<if .skills>>
\section{Skills}
\begin{itemize}[leftmargin=4mm, itemsep=2pt, parsep=2pt]
  <<range $index, $skill := .skills>>
  \item \textbf{<<escape_latex $skill.name>>}<<if $skill.level>> (\textit{<<escape_latex $skill.level>>})<<end>>
    <<if $skill.description>>
    
    <<escape_latex $skill.description>>
    <<end>>
  <<end>>
\end{itemize}
<<end>>

<<if .languages>>
\section{Languages}
\begin{itemize}[leftmargin=4mm, itemsep=2pt, parsep=2pt]
  <<range $index, $language := .languages>>
  \item \textbf{<<escape_latex $language.name>>}<<if $language.level>> (\textit{<<escape_latex $language.level>>})<<end>>
    <<if $language.description>>
    
    <<escape_latex $language.description>>
    <<end>>
  <<end>>
\end{itemize}
<<end>>

<<if .certificates>>
\section{Certifications}
\begin{itemize}[leftmargin=4mm, itemsep=2pt, parsep=2pt]
  <<range .certificates>>
  \item \textbf{<<escape_latex .name>>}<<if .granted_date>> (\textit{<<escape_latex .granted_date>>})<<end>>
    <<if .issuer>>
    
    \textit{Issued by} <<escape_latex .issuer>>
    <<end>>
    <<if .description>>
    <<if .is_raw_latex>>
    <<.description>>
    <<else>>
    <<escape_latex .description>>
    <<end>>
    <<end>>
  <<end>>
\end{itemize}
<<end>>

\end{paracol}

\end{document}`
