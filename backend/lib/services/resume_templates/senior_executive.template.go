package resumetemplates

import (
	"backend/lib/utils"
	"backend/sqlc_gen"
	"time"
)

// ConvertResumeToLatex_SENIOR_EXECUTIVE converts resume data, user info, and profile info to a LaTeX document
// using a professional senior executive format optimized for leadership positions
func ConvertResumeToLatex_SENIOR_EXECUTIVE(language string, resume_data utils.InputResumeData, user sqlc_gen.GetUserByIdRow, profile sqlc_gen.GetProfileByUserIdRow) (string, error) {
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
	if language == "fr" {
		return render_latex_document(template_data, "columns-executive", FR_SENIOR_EXECUTIVE_TEMPLATE)
	} else {
		return render_latex_document(template_data, "columns-executive", EN_SENIOR_EXECUTIVE_TEMPLATE)
	}
}

// LaTeX senior executive template
const EN_SENIOR_EXECUTIVE_TEMPLATE = `\documentclass[11pt,letterpaper]{article}

% Packages
\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[pdftex]{hyperref}
\usepackage{fancyhdr}

% Configure hyperref
\hypersetup{
    pdfauthor={<<escape_latex .user.FullName>>},
    pdftitle={Executive Resume - <<escape_latex .user.FullName>>}
}

\pagestyle{fancy}
\fancyhf{} % clear all header and footer fields
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Adjust margins
\addtolength{\oddsidemargin}{-0.375in}
\addtolength{\evensidemargin}{-0.375in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Sections formatting
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

% Custom commands
\newcommand{\resumeItem}[2]{
  \item\small{
    \textbf{#1}{: #2 \vspace{-2pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-1pt}\item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-5pt}
}

\newcommand{\resumeSubItem}[2]{\resumeItem{#1}{#2}\vspace{-4pt}}

\renewcommand{\labelitemii}{$\circ$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=*]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

\begin{document}

%----------HEADING-----------------
\begin{tabular*}{\textwidth}{l@{\extracolsep{\fill}}r}
  \textbf{{\Large <<escape_latex .user.FullName>>}} & <<if .user.Email>>Email : {<<escape_latex .user.Email>>}<<end>>\\
   & <<if .user.Phone>>Mobile : <<escape_latex .user.Phone>><<end>>\\
\end{tabular*}


% Profile/Summary SectionPhone>>\
<<if .profile.Description>>
\section{About me}
\vspace{0.3em}
<<escape_latex .profile.Description>>
<<end>>

% Experience Section
<<if .experience>>
\section{Experiences}
\resumeSubHeadingListStart
<<range .experience>>
    \resumeSubheading
      {<<escape_latex .company>>}{<<if .location>><<escape_latex .location>><<end>>}
      {<<escape_latex .title>>}{<<escape_latex .start_date>> - <<if .end_date>><<escape_latex .end_date>><<else>>Present<<end>>}

<<if .description>>
<<if .is_raw_latex>>
<<.description>>
<<else>>
\begin{itemize}
  <<range $index, $bullet := (split .description "\n")>>
    \item\small{<<escape_latex $bullet>> \vspace{-2pt}}
  <<end>>
\end{itemize}\vspace{-5pt}
<<end>>
<<end>>
<<end>>
\resumeSubHeadingListEnd
<<end>>

% Skills Section
<<if .skills>>
\section{Skills}
\resumeSubHeadingListStart
<<range .skills>>
\item{\textbf{<<escape_latex .name>>}{<<if .description>>
<<if .is_raw_latex>>
<<.description>>
<<else>>
<<escape_latex .description>>
<<end>>
<<end>>}}
<<end>>
\resumeSubHeadingListEnd
<<end>>

% Projects Section
<<if .project>>
\section{Projects}
\resumeSubHeadingListStart
<<range .project>>
    \resumeSubheading
      {<<escape_latex .title>>}{}
      {<<if .subtitle>><<escape_latex .subtitle>><<end>>}{<<escape_latex .start_date>> - <<if .end_date>><<escape_latex .end_date>><<else>>Present<<end>>}

<<if .description>>
<<if .is_raw_latex>>
<<.description>>
<<else>>
\begin{itemize}
  <<range $index, $bullet := (split .description "\n")>>
    \item\small{<<escape_latex $bullet>> \vspace{-2pt}}
  <<end>>
\end{itemize}\vspace{-5pt}
<<end>>
<<end>>
<<end>>
\resumeSubHeadingListEnd
<<end>>

% Certifications Section
<<if .certificates>>
\section{Certifications}
\resumeSubHeadingListStart
<<range .certificates>>
    \resumeSubheading
      {<<escape_latex .name>>}{<<if .location>><<escape_latex .location>><<end>>}
      {<<if .issuer>><<escape_latex .issuer>><<end>>}{<<escape_latex .granted_date>>}

<<if .description>>
<<if .is_raw_latex>>
<<.description>>
<<else>>
\begin{itemize}
  <<range $index, $bullet := (split .description "\n")>>
    \item\small{<<escape_latex $bullet>> \vspace{-2pt}}
  <<end>>
\end{itemize}\vspace{-5pt}
<<end>>
<<end>>
<<end>>
\resumeSubHeadingListEnd
<<end>>

% Education Section
<<if .education>>
\section{Educations}
\resumeSubHeadingListStart
<<range .education>>
    \resumeSubheading
      {<<escape_latex .school>>}{<<if .location>><<escape_latex .location>><<end>>}
      {<<escape_latex .degree>>}{<<escape_latex .start_date>> - <<if .end_date>><<escape_latex .end_date>><<else>>Present<<end>>}

<<if .description>>
<<if .is_raw_latex>>
<<.description>>
<<else>>
\begin{itemize}
  <<range $index, $bullet := (split .description "\n")>>
    \item\small{<<escape_latex $bullet>> \vspace{-2pt}}
  <<end>>
\end{itemize}\vspace{-5pt}
<<end>>
<<end>>
<<end>>
\resumeSubHeadingListEnd
<<end>>

% Languages Section
<<if .languages>>
\section{Languages}
\resumeSubHeadingListStart
<<range .languages>>
\item{\textbf{<<escape_latex .name>>} {<<escape_latex .level>>}}
<<end>>
\resumeSubHeadingListEnd
<<end>>

\end{document}`

const FR_SENIOR_EXECUTIVE_TEMPLATE = `\documentclass[11pt,letterpaper]{article}

% Packages
\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[pdftex]{hyperref}
\usepackage{fancyhdr}

% Configure hyperref
\hypersetup{
    pdfauthor={<<escape_latex .user.FullName>>},
    pdftitle={Executive Resume - <<escape_latex .user.FullName>>}
}

\pagestyle{fancy}
\fancyhf{} % clear all header and footer fields
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Adjust margins
\addtolength{\oddsidemargin}{-0.375in}
\addtolength{\evensidemargin}{-0.375in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Sections formatting
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

% Custom commands
\newcommand{\resumeItem}[2]{
  \item\small{
    \textbf{#1}{: #2 \vspace{-2pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-1pt}\item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-5pt}
}

\newcommand{\resumeSubItem}[2]{\resumeItem{#1}{#2}\vspace{-4pt}}

\renewcommand{\labelitemii}{$\circ$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=*]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

\begin{document}

%----------HEADING-----------------
\begin{tabular*}{\textwidth}{l@{\extracolsep{\fill}}r}
  \textbf{{\Large <<escape_latex .user.FullName>>}} & <<if .user.Email>>Email : {<<escape_latex .user.Email>>}<<end>>\\
   & <<if .user.Phone>>Mobile : <<escape_latex .user.Phone>><<end>>\\
\end{tabular*}


% Profile/Summary SectionPhone>>\
<<if .profile.Description>>
\section{À propos de moi}
\vspace{0.3em}
<<escape_latex .profile.Description>>
<<end>>

% Experience Section
<<if .experience>>
\section{Experiences}
\resumeSubHeadingListStart
<<range .experience>>
    \resumeSubheading
      {<<escape_latex .company>>}{<<if .location>><<escape_latex .location>><<end>>}
      {<<escape_latex .title>>}{<<escape_latex .start_date>> - <<if .end_date>><<escape_latex .end_date>><<else>>Present<<end>>}

<<if .description>>
<<if .is_raw_latex>>
<<.description>>
<<else>>
\begin{itemize}
  <<range $index, $bullet := (split .description "\n")>>
    \item\small{<<escape_latex $bullet>> \vspace{-2pt}}
  <<end>>
\end{itemize}\vspace{-5pt}
<<end>>
<<end>>
<<end>>
\resumeSubHeadingListEnd
<<end>>

% Skills Section
<<if .skills>>
\section{Compétences}
\resumeSubHeadingListStart
<<range .skills>>
\item{\textbf{<<escape_latex .name>>}{<<if .description>>
<<if .is_raw_latex>>
<<.description>>
<<else>>
<<escape_latex .description>>
<<end>>
<<end>>}}
<<end>>
\resumeSubHeadingListEnd
<<end>>

% Projects Section
<<if .project>>
\section{Projets}
\resumeSubHeadingListStart
<<range .project>>
    \resumeSubheading
      {<<escape_latex .title>>}{}
      {<<if .subtitle>><<escape_latex .subtitle>><<end>>}{<<escape_latex .start_date>> - <<if .end_date>><<escape_latex .end_date>><<else>>Present<<end>>}

<<if .description>>
<<if .is_raw_latex>>
<<.description>>
<<else>>
\begin{itemize}
  <<range $index, $bullet := (split .description "\n")>>
    \item\small{<<escape_latex $bullet>> \vspace{-2pt}}
  <<end>>
\end{itemize}\vspace{-5pt}
<<end>>
<<end>>
<<end>>
\resumeSubHeadingListEnd
<<end>>

% Certifications Section
<<if .certificates>>
\section{Certificats}
\resumeSubHeadingListStart
<<range .certificates>>
    \resumeSubheading
      {<<escape_latex .name>>}{<<if .location>><<escape_latex .location>><<end>>}
      {<<if .issuer>><<escape_latex .issuer>><<end>>}{<<escape_latex .granted_date>>}

<<if .description>>
<<if .is_raw_latex>>
<<.description>>
<<else>>
\begin{itemize}
  <<range $index, $bullet := (split .description "\n")>>
    \item\small{<<escape_latex $bullet>> \vspace{-2pt}}
  <<end>>
\end{itemize}\vspace{-5pt}
<<end>>
<<end>>
<<end>>
\resumeSubHeadingListEnd
<<end>>

% Education Section
<<if .education>>
\section{Éducations}
\resumeSubHeadingListStart
<<range .education>>
    \resumeSubheading
      {<<escape_latex .school>>}{<<if .location>><<escape_latex .location>><<end>>}
      {<<escape_latex .degree>>}{<<escape_latex .start_date>> - <<if .end_date>><<escape_latex .end_date>><<else>>Present<<end>>}

<<if .description>>
<<if .is_raw_latex>>
<<.description>>
<<else>>
\begin{itemize}
  <<range $index, $bullet := (split .description "\n")>>
    \item\small{<<escape_latex $bullet>> \vspace{-2pt}}
  <<end>>
\end{itemize}\vspace{-5pt}
<<end>>
<<end>>
<<end>>
\resumeSubHeadingListEnd
<<end>>

% Languages Section
<<if .languages>>
\section{Langages}
\resumeSubHeadingListStart
<<range .languages>>
\item{\textbf{<<escape_latex .name>>} {<<escape_latex .level>>}}
<<end>>
\resumeSubHeadingListEnd
<<end>>

\end{document}`
