package resumetemplates

import (
	"backend/lib/utils"
	"backend/sqlc_gen"
	"sort"
	"time"
)

func ConvertResumeToLatex_LIGHT_EXECUTIVE(resume_data utils.InputResumeData, user sqlc_gen.GetUserByIdRow, profile sqlc_gen.GetProfileByUserIdRow) (string, error) {
	// Create a map to hold all the data for the template
	template_data := make(map[string]any)

	// Add user and profile data
	template_data["user"] = user
	template_data["profile"] = profile

	// Format and add resume sections
	template_data["education"] = format_education_section(resume_data.Educations)
	template_data["experience"] = format_experience_section(resume_data.Experiences)
	template_data["skills"] = format_skills_for_light_executive_template(resume_data.Skills)
	template_data["projects"] = format_projects_section(resume_data.Projects)
	template_data["certificates"] = format_certificates_section(resume_data.Certificates)

	// Get current date for "last updated" field
	current_time := time.Now()
	template_data["last_updated_month"] = current_time.Format("January")
	template_data["last_updated_year"] = current_time.Format("2006")

	// Execute the template
	return render_latex_document(template_data, "light-executive", light_executive_template)
}

func format_skills_for_light_executive_template(skills []utils.Skill) []map[string]string {
	if len(skills) == 0 {
		return []map[string]string{}
	}

	// Sort skills by priority
	sort.Slice(skills, func(i, j int) bool {
		return skills[i].Priority < skills[j].Priority
	})

	// Format visible skills
	formatted_skills := make([]map[string]string, 0, len(skills))
	for _, skill := range skills {
		if !skill.IsVisible {
			continue
		}

		skill_item := map[string]string{
			"name":        skill.SkillName,
			"level":       skill.OptionalSkillLevel,
			"description": skill.Description,
		}

		formatted_skills = append(formatted_skills, skill_item)
	}

	return formatted_skills
}

// LaTeX elegant professional template
const light_executive_template = `\documentclass[11pt, a4paper]{article} 

\usepackage[T1]{fontenc}     % We are using pdfLaTeX,
\usepackage[utf8]{inputenc}  % hence this preparation
\usepackage[british]{babel}  
\usepackage[left = 0mm, right = 0mm, top = 0mm, bottom = 0mm]{geometry}
\usepackage[stretch = 25, shrink = 25, tracking=true, letterspace=30]{microtype}  
\usepackage{graphicx}        % To insert pictures
\usepackage{xcolor}          % To add colour to the document
\usepackage{marvosym}        % Provides icons for the contact details

\usepackage{enumitem}        % To redefine spacing in lists
\setlist{parsep = 0pt, topsep = 0pt, partopsep = 1pt, itemsep = 1pt, leftmargin = 6mm}

\usepackage{FiraSans}        % Change this to use any font, but keep it simple
\renewcommand{\familydefault}{\sfdefault}

\definecolor{cvblue}{HTML}{304263}

%%%%%%% USER COMMAND DEFINITIONS %%%%%%%%%%%%%%%%%%%%%%%%%%%
% These are the real workhorses of this template
\newcommand{\dates}[1]{\hfill\mbox{\textbf{#1}}} % Bold stuff that doesn't got broken into lines
\newcommand{\is}{\par\vskip.5ex plus .4ex} % Item spacing
\newcommand{\smaller}[1]{{\small$\diamond$\ #1}}
\newcommand{\headleft}[1]{\vspace*{3ex}\textsc{\textbf{#1}}\par%
    \vspace*{-1.5ex}\hrulefill\par\vspace*{0.7ex}}
\newcommand{\headright}[1]{\vspace*{2.5ex}\textsc{\Large\color{cvblue}#1}\par%
     \vspace*{-2ex}{\color{cvblue}\hrulefill}\par}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\usepackage[colorlinks = true, urlcolor = white, linkcolor = white]{hyperref}

\begin{document}

% Style definitions -- killing the unnecessary space and adding the skips explicitly
\setlength{\topskip}{0pt}
\setlength{\parindent}{0pt}
\setlength{\parskip}{0pt}
\setlength{\fboxsep}{0pt}
\pagestyle{empty}
\raggedbottom

\begin{minipage}[t]{0.33\textwidth} %% Left column -- outer definition
%  Left column -- top dark rectangle
\colorbox{cvblue}{\begin{minipage}[t][5mm][t]{\textwidth}\null\hfill\null\end{minipage}}

\vspace{-.2ex} % Eliminates the small gap
\colorbox{cvblue!90}{\color{white}  %% LEFT BOX
\kern0.09\textwidth\relax% Left margin provided explicitly
\begin{minipage}[t][293mm][t]{0.82\textwidth}
\raggedright
\vspace*{2.5ex}

\Large <<escape_latex .user.FullName>> \normalsize 

% Profile picture would go here
\vspace*{2ex}

\headleft{Profile}
<<escape_latex .profile.Description>>

\headleft{Contact details}
\small % To fit more content
\MVAt\ <<escape_latex .user.Email>> \\[0.4ex]
<<if .user.Phone>>\Mobilefone\ <<escape_latex .user.Phone>> \\[0.5ex]<<end>>
<<if .profile.Website>>\Mundus\ \href{<<.profile.Website>>}{<<escape_latex .profile.Website>>} \\[0.1ex]<<end>>
<<if .profile.Linkedin>>\Mundus\ \href{<<.profile.Linkedin>>}{<<escape_latex .profile.Linkedin>>} \\[0.1ex]<<end>>
<<if .user.Location>>\Letter\ <<escape_latex .user.Location>><<end>>
\normalsize

\headleft{Skills}
\begin{itemize}
<<range .skills>>
\item <<escape_latex .name>><<if .level>> (<<escape_latex .level>>)<<end>>
<<end>>
\end{itemize} 

<<if .certificates>>
\headleft{Certifications}
\begin{itemize}
<<range .certificates>>
\item <<escape_latex .name>><<if .issuer>> - <<escape_latex .issuer>><<end>>
<<end>>
\end{itemize}
<<end>>

\end{minipage}%
\kern0.09\textwidth\relax%%Right margin provided explicitly to stretch the colourbox
}
\end{minipage}% Right column
\hskip2.5em% Left margin for the white area
\begin{minipage}[t]{0.56\textwidth}
\setlength{\parskip}{0.8ex}% Adds spaces between paragraphs; use \\ to add new lines without this space. Shrink this amount to fit more data vertically

\vspace{2ex}

\headright{Experience}

<<range .experience>>
\textsc{<<escape_latex .title>>} at \textit{<<escape_latex .company>><<if .location>> (<<escape_latex .location>>)<<end>>.}  \dates{<<escape_latex .start_date>><<if .end_date>>--<<escape_latex .end_date>><<end>>} \\
<<if .description>>
<<if .is_raw_latex>>
<<.description>>
<<else>>
\smaller{<<escape_latex .description>>}
<<end>>
<<end>>

\is
<<end>>

\headright{Education}

<<range $i, $edu := .education>>
<<if lt $i 2>>
\textsc{<<escape_latex $edu.degree>>.} <<if $edu.school>>\textit{<<escape_latex $edu.school>>}.<<end>>  \dates{<<escape_latex $edu.start_date>><<if $edu.end_date>>--<<escape_latex $edu.end_date>><<end>>} \\
<<if $edu.description>>
<<if $edu.is_raw_latex>>
<<$edu.description>>
<<else>>
\smaller{<<escape_latex $edu.description>>}
<<end>>
<<end>>

\is
<<end>>
<<end>>

<<if .projects>>
\headright{Projects}

<<range .projects>>
\textsc{<<escape_latex .title>>}<<if .subtitle>> - \textit{<<escape_latex .subtitle>>}<<end>>  <<if .date_display>>\dates{<<escape_latex .date_display>>}<<end>> \\
<<if .description>>
<<if .is_raw_latex>>
<<.description>>
<<else>>
\smaller{<<escape_latex .description>>}
<<end>>
<<end>>

\is
<<end>>
<<end>>

\end{minipage}

\end{document}`
