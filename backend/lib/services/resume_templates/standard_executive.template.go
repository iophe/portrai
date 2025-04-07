package resumetemplates

import (
	"backend/lib/utils"
	"backend/sqlc_gen"
	"bytes"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"text/template"
	"time"
)

// ConvertResumeToLatex_STANDARD_EXECUTIVE converts resume data, user info, and profile info to a LaTeX document
func ConvertResumeToLatex_STANDARD_EXECUTIVE(resume_data utils.InputResumeData, user sqlc_gen.GetUserByIdRow, profile sqlc_gen.GetProfileByUserIdRow) (string, error) {
	// Create a map to hold all the data for the template
	template_data := make(map[string]any)

	// Add user and profile data
	template_data["user"] = user
	template_data["profile"] = profile

	// Format and add resume sections
	template_data["education"] = format_education_section(resume_data.Educations)
	template_data["experience"] = format_experience_section(resume_data.Experiences)
	template_data["skills"] = format_skills_section(resume_data.Skills)
	template_data["projects"] = format_projects_section(resume_data.Projects)
	template_data["certificates"] = format_certificates_section(resume_data.Certificates)

	// Get current date for "last updated" field
	current_time := time.Now()
	template_data["last_updated_month"] = current_time.Format("January")
	template_data["last_updated_year"] = current_time.Format("2006")

	// Execute the template
	return render_latex_document(template_data)
}

// Helper function to render the LaTeX document
func render_latex_document(template_data map[string]interface{}) (string, error) {
	tmpl, err := template.New("resume").Delims("<<", ">>").Funcs(template.FuncMap{
		"escape_latex": escape_latex_special_chars,
		"split":        split,
	}).Parse(resume_template)

	if err != nil {
		return "", fmt.Errorf("error parsing template: %v", err)
	}

	var buf bytes.Buffer
	err = tmpl.Execute(&buf, template_data)
	if err != nil {
		return "", fmt.Errorf("error executing template: %v", err)
	}

	return buf.String(), nil
}

// Helper function to format education section
func format_education_section(educations []utils.Education) []map[string]string {
	if len(educations) == 0 {
		return []map[string]string{}
	}

	// Sort educations by priority
	sort.Slice(educations, func(i, j int) bool {
		return educations[i].Priority < educations[j].Priority
	})

	// Format visible educations
	formatted_educations := make([]map[string]string, 0, len(educations))
	for _, edu := range educations {
		if !edu.IsVisible {
			continue
		}

		is_latex := is_raw_latex(edu.Description)
		edu_entry := map[string]string{
			"school":       edu.School,
			"degree":       edu.Degree,
			"location":     edu.Location,
			"start_date":   format_date(edu.StartDate),
			"description":  edu.Description,
			"is_raw_latex": strconv.FormatBool(is_latex),
		}

		if edu.IsCurrent {
			edu_entry["end_date"] = "Present"
		} else if edu.OptionalEndDate != "" {
			edu_entry["end_date"] = format_date(edu.OptionalEndDate)
		} else {
			edu_entry["end_date"] = ""
		}

		formatted_educations = append(formatted_educations, edu_entry)
	}

	return formatted_educations
}

// Helper function to format experience section
func format_experience_section(experiences []utils.Experience) []map[string]string {
	if len(experiences) == 0 {
		return []map[string]string{}
	}

	// Sort experiences by priority
	sort.Slice(experiences, func(i, j int) bool {
		return experiences[i].Priority < experiences[j].Priority
	})

	// Format visible experiences
	formatted_experiences := make([]map[string]string, 0, len(experiences))
	for _, exp := range experiences {
		if !exp.IsVisible {
			continue
		}

		is_latex := is_raw_latex(exp.Description)
		exp_entry := map[string]string{
			"company":      exp.CompanyName,
			"title":        exp.JobTitle,
			"location":     exp.Location,
			"start_date":   format_date(exp.StartDate),
			"description":  exp.Description,
			"is_raw_latex": strconv.FormatBool(is_latex),
		}

		if exp.IsCurrent {
			exp_entry["end_date"] = "Present"
		} else if exp.OptionalEndDate != "" {
			exp_entry["end_date"] = format_date(exp.OptionalEndDate)
		} else {
			exp_entry["end_date"] = ""
		}

		formatted_experiences = append(formatted_experiences, exp_entry)
	}

	return formatted_experiences
}

// Helper function to format skills section
func format_skills_section(skills []utils.Skill) map[string][]map[string]string {
	if len(skills) == 0 {
		return map[string][]map[string]string{}
	}

	// Group skills by type
	skill_groups := make(map[string][]map[string]string)

	// Sort skills by priority
	sort.Slice(skills, func(i, j int) bool {
		return skills[i].Priority < skills[j].Priority
	})

	for _, skill := range skills {
		if !skill.IsVisible {
			continue
		}

		skill_type := skill.OptionalSkillType
		if skill_type == "" {
			skill_type = "General"
		}

		// Create a map with name and description
		skill_info := map[string]string{
			"name":        skill.SkillName,
			"description": skill.Description,
			"level":       skill.OptionalSkillLevel,
		}

		skill_groups[skill_type] = append(skill_groups[skill_type], skill_info)
	}

	return skill_groups
}

// Helper function to format projects section
func format_projects_section(projects []utils.Project) []map[string]string {
	if len(projects) == 0 {
		return []map[string]string{}
	}

	// Sort projects by priority
	sort.Slice(projects, func(i, j int) bool {
		return projects[i].Priority < projects[j].Priority
	})

	// Format visible projects
	formatted_projects := make([]map[string]string, 0, len(projects))
	for _, proj := range projects {
		if !proj.IsVisible {
			continue
		}

		is_latex := is_raw_latex(proj.Description)
		proj_entry := map[string]string{
			"title":        proj.ProjectTitle,
			"subtitle":     proj.OptionalProjectSubtitle,
			"start_date":   format_date(proj.OptionalStartDate),
			"description":  proj.Description,
			"is_raw_latex": strconv.FormatBool(is_latex),
		}

		if proj.IsCurrent {
			proj_entry["end_date"] = "Present"
		} else if proj.OptionalEndDate != "" {
			proj_entry["end_date"] = format_date(proj.OptionalEndDate)
		} else {
			proj_entry["end_date"] = ""
		}

		// Format date display
		if proj_entry["start_date"] != "" && proj_entry["end_date"] != "" {
			proj_entry["date_display"] = proj_entry["start_date"] + " – " + proj_entry["end_date"]
		} else if proj_entry["start_date"] != "" {
			proj_entry["date_display"] = proj_entry["start_date"]
		} else if proj_entry["end_date"] != "" {
			proj_entry["date_display"] = proj_entry["end_date"]
		} else {
			proj_entry["date_display"] = ""
		}

		formatted_projects = append(formatted_projects, proj_entry)
	}

	return formatted_projects
}

// Helper function to format certificates section
func format_certificates_section(certificates []utils.Certificate) []map[string]string {
	if len(certificates) == 0 {
		return []map[string]string{}
	}

	// Sort certificates by priority
	sort.Slice(certificates, func(i, j int) bool {
		return certificates[i].Priority < certificates[j].Priority
	})

	// Format visible certificates
	formatted_certificates := make([]map[string]string, 0, len(certificates))
	for _, cert := range certificates {
		if !cert.IsVisible {
			continue
		}

		is_latex := is_raw_latex(cert.Description)
		cert_entry := map[string]string{
			"name":         cert.CertificateName,
			"issuer":       cert.OptionalIssuer,
			"location":     cert.OptionalLocation,
			"granted_date": format_date(cert.OptionalGrantedDate),
			"description":  cert.Description,
			"is_raw_latex": strconv.FormatBool(is_latex),
		}

		formatted_certificates = append(formatted_certificates, cert_entry)
	}

	return formatted_certificates
}

// Helper function to format dates (assuming ISO format input)
func format_date(date_str string) string {
	if date_str == "" {
		return ""
	}

	// Try to parse the date
	var date_formats = []string{
		"2006-01-02",
		"2006-01",
		"2006",
		"Jan 2006",
		"January 2006",
	}

	var parsed_time time.Time
	var err error

	for _, format := range date_formats {
		parsed_time, err = time.Parse(format, date_str)
		if err == nil {
			break
		}
	}

	if err != nil {
		// If we can't parse it, return it as is
		return date_str
	}

	// Format as "Month Year" (e.g., "Sept 2000")
	return parsed_time.Format("Jan 2006")
}

// Helper function to determine if text should be treated as raw LaTeX
func is_raw_latex(text string) bool {
	// Check for common LaTeX environments or commands
	latex_indicators := []string{
		"\\begin{",
		"\\end{",
		"\\item",
		"\\textbf{",
		"\\textit{",
		"\\section",
		"\\subsection",
	}

	for _, indicator := range latex_indicators {
		if strings.Contains(text, indicator) {
			return true
		}
	}

	return false
}

// Helper function to escape LaTeX special characters
func escape_latex_special_chars(text string) string {
	var result strings.Builder
	result.Grow(len(text) * 2)

	for _, char := range text {
		switch char {
		case '\\':
			result.WriteString("\\textbackslash{}")
		case '&':
			result.WriteString("\\&")
		case '%':
			result.WriteString("\\%")
		case '$':
			result.WriteString("\\$")
		case '#':
			result.WriteString("\\#")
		case '_':
			result.WriteString("\\_")
		case '{':
			result.WriteString("\\{")
		case '}':
			result.WriteString("\\}")
		case '~':
			result.WriteString("\\textasciitilde{}")
		case '^':
			result.WriteString("\\textasciicircum{}")
		default:
			result.WriteRune(char)
		}
	}

	return result.String()
}

func split(s string, sep string) []string {
	return strings.Split(s, sep)
}

// LaTeX resume template
const resume_template = `\documentclass[10pt, letterpaper]{article}

% Packages:
\usepackage[
    ignoreheadfoot, % set margins without considering header and footer
    top=2 cm, % seperation between body and page edge from the top
    bottom=2 cm, % seperation between body and page edge from the bottom
    left=2 cm, % seperation between body and page edge from the left
    right=2 cm, % seperation between body and page edge from the right
    footskip=1.0 cm, % seperation between body and footer
    % showframe % for debugging 
]{geometry} % for adjusting page geometry
\usepackage{titlesec} % for customizing section titles
\usepackage{tabularx} % for making tables with fixed width columns
\usepackage{array} % tabularx requires this
\usepackage[dvipsnames]{xcolor} % for coloring text
\definecolor{primaryColor}{RGB}{0, 79, 144} % define primary color
\usepackage{enumitem} % for customizing lists
\usepackage{fontawesome5} % for using icons
\usepackage{amsmath} % for math
\usepackage[
    pdftitle={ <<escape_latex .user.FullName>>'s CV},
    pdfauthor={ <<escape_latex .user.FullName>> },
    pdfcreator={LaTeX with RenderCV},
    colorlinks=true,
    urlcolor=primaryColor
]{hyperref} % for links, metadata and bookmarks
\usepackage[pscoord]{eso-pic} % for floating text on the page
\usepackage{calc} % for calculating lengths
\usepackage{bookmark} % for bookmarks
\usepackage{changepage} % for one column entries (adjustwidth environment)
\usepackage{paracol} % for two and three column entries
\usepackage{ifthen} % for conditional statements
\usepackage{needspace} % for avoiding page brake right after the section title
\usepackage{iftex} % check if engine is pdflatex, xetex or luatex

% Ensure that generate pdf is machine readable/ATS parsable:
\ifPDFTeX
    \input{glyphtounicode}
    \pdfgentounicode=1
    % \usepackage[T1]{fontenc} % this breaks sb2nov
    \usepackage[utf8]{inputenc}
    \usepackage{lmodern}
\fi

% Some settings:
\AtBeginEnvironment{adjustwidth}{\partopsep0pt} % remove space before adjustwidth environment
\pagestyle{empty} % no header or footer
\setcounter{secnumdepth}{0} % no section numbering
\setlength{\parindent}{0pt} % no indentation
\setlength{\topskip}{0pt} % no top skip
\setlength{\columnsep}{0cm} % set column seperation
\makeatletter

\titleformat{\section}{\needspace{4\baselineskip}\bfseries\large}{}{0pt}{}[\vspace{1pt}\titlerule]

\titlespacing{\section}{
    % left space:
    -1pt
}{
    % top space:
    0.3 cm
}{
    % bottom space:
    0.2 cm
} % section title spacing

\renewcommand\labelitemi{$\circ$} % custom bullet points
\newenvironment{highlights}{
    \begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=0.4 cm + 10pt
    ]
}{
    \end{itemize}
} % new environment for highlights

\newenvironment{highlightsforbulletentries}{
    \begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=10pt
    ]
}{
    \end{itemize}
} % new environment for highlights for bullet entries


\newenvironment{onecolentry}{
    \begin{adjustwidth}{
        0.2 cm + 0.00001 cm
    }{
        0.2 cm + 0.00001 cm
    }
}{
    \end{adjustwidth}
} % new environment for one column entries

\newenvironment{twocolentry}[2][]{
    \onecolentry
    \def\secondColumn{#2}
    \setcolumnwidth{\fill, 4.5 cm}
    \begin{paracol}{2}
}{
    \switchcolumn \raggedleft \secondColumn
    \end{paracol}
    \endonecolentry
} % new environment for two column entries

\newenvironment{header}{
    \setlength{\topsep}{0pt}\par\kern\topsep\centering\linespread{1.5}
}{
    \par\kern\topsep
} % new environment for the header

\newcommand{\placelastupdatedtext}{% \placetextbox{<horizontal pos>}{<vertical pos>}{<stuff>}
  \AddToShipoutPictureFG*{% Add <stuff> to current page foreground
    \put(
        \LenToUnit{\paperwidth-2 cm-0.2 cm+0.05cm},
        \LenToUnit{\paperheight-1.0 cm}
    ){\vtop{{\null}\makebox[0pt][c]{
        \small\color{gray}\textit{Last updated in <<.last_updated_month>> <<.last_updated_year>>}\hspace{\widthof{Last updated in <<.last_updated_month>> <<.last_updated_year>> } }
    }}}%
  }%
}%

% save the original href command in a new command:
\let\hrefWithoutArrow\href

% new command for external links:
\renewcommand{\href}[2]{\hrefWithoutArrow{#1}{\ifthenelse{\equal{#2}{}}{ }{#2 }\raisebox{.15ex}{\footnotesize \faExternalLink*}}}


\begin{document}
    \newcommand{\AND}{\unskip
        \cleaders\copy\ANDbox\hskip\wd\ANDbox
        \ignorespaces
    }
    \newsavebox\ANDbox
    \sbox\ANDbox{}

    \placelastupdatedtext
    \begin{header}
        \textbf{\fontsize{24 pt}{24 pt}\selectfont <<escape_latex .user.FullName>>}

        \vspace{0.3 cm}

        \normalsize<<if .user.Location>>
        \mbox{{\color{black}\footnotesize\faMapMarker*}\hspace*{0.13cm}<<escape_latex .user.Location>>}%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%<<end>><<if .user.Email>>
        \mbox{\hrefWithoutArrow{mailto:<<.user.Email>>}{\color{black}{\footnotesize\faEnvelope[regular]}\hspace*{0.13cm}<<escape_latex .user.Email>> } }%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%<<end>><<if .user.Phone>>
        \mbox{
			\hrefWithoutArrow{
				tel:<<.user.Phone>>}
				{\color{black}{\footnotesize\faPhone*}\hspace*{0.13cm}<<escape_latex .user.Phone>>
			}
		}%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%<<end>><<if .profile.Website>>
        \mbox{\hrefWithoutArrow{<<.profile.Website>>}{\color{black}{\footnotesize\faLink}\hspace*{0.13cm}<<escape_latex .profile.Website>> } }%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%<<end>><<if .profile.Linkedin>>
        \mbox{\hrefWithoutArrow{<<.profile.Linkedin>>}{\color{black}{\footnotesize\faLinkedinIn}\hspace*{0.13cm}<<escape_latex .profile.Linkedin>> } }%
        \kern 0.25 cm%<<end>>
    \end{header}

    \vspace{0.3 cm - 0.3 cm}

    <<if .profile.Description>>
    \section{Profile}
    \begin{onecolentry}
        <<escape_latex .profile.Description>>
    \end{onecolentry}
    <<end>>
    
    <<if .experience>>
    \section{Experience}
    <<range .experience>>
        \begin{twocolentry}{
        <<if .location>>
        \textit{<<escape_latex .location>>}    
        <<end>>
        <<if and .start_date .end_date>>
        \textit{<<escape_latex .start_date>> – <<escape_latex .end_date>>}
        <<else if .start_date>>
        \textit{<<escape_latex .start_date>>}
        <<end>>
        }
            \textbf{<<escape_latex .title>>}
            <<if .company>>
            \textit{<<escape_latex .company>>}
            <<end>>
        \end{twocolentry}

        <<if .description>>
        \vspace{0.10 cm}
        \begin{onecolentry}
        	<<if .is_raw_latex>>
        	<<.description>>
        	<<else>>
        	\begin{highlights}
        	    <<range $index, $bullet := (split .description "\n")>>
        	    \item <<escape_latex $bullet>>
        	    <<end>>
        	\end{highlights}
        	<<end>>
        \end{onecolentry}
        <<end>>
        \vspace{0.2 cm}
    <<end>>
    <<end>>
    
 <<if .education>>
    \section{Education}
    <<range .education>>
        \begin{twocolentry}{
        <<if .location>>
        \textit{<<escape_latex .location>>}    
        <<end>>
        <<if and .start_date .end_date>>
        \textit{<<escape_latex .start_date>> – <<escape_latex .end_date>>}
        <<else if .start_date>>
        \textit{<<escape_latex .start_date>>}
        <<end>>
        }
            \textbf{<<escape_latex .school>>}
            <<if .degree>>
            \textit{<<escape_latex .degree>>}
            <<end>>
        \end{twocolentry}

        <<if .description>>
        \vspace{0.10 cm}
        \begin{onecolentry}
        	<<if .is_raw_latex>>
        	<<.description>>
        	<<else>>
        	\begin{highlights}
        	    <<range $index, $bullet := (split .description "\n")>>
        	    \item <<escape_latex $bullet>>
        	    <<end>>
        	\end{highlights}
        	<<end>>
        \end{onecolentry}
        <<end>>
        \vspace{0.2 cm}
    <<end>>
    <<end>>

    <<if .projects>>
    \section{Projects}
    <<range .projects>>
        \begin{twocolentry}{
        <<if .subtitle>>
        \textit{<<escape_latex .subtitle>>}    
        <<end>>
        <<if .date_display>>
        \textit{<<escape_latex .date_display>>}
        <<end>>
        }
            \textbf{<<escape_latex .title>>}
        \end{twocolentry}

        <<if .description>>
        \vspace{0.10 cm}
        \begin{onecolentry}
        	<<if .is_raw_latex>>
        	<<.description>>
        	<<else>>
        	\begin{highlights}
        	    <<range $index, $bullet := (split .description "\n")>>
        	    \item <<escape_latex $bullet>>
        	    <<end>>
        	\end{highlights}
        	<<end>>
        \end{onecolentry}
        <<end>>
        \vspace{0.2 cm}
    <<end>>
    <<end>>
    
    <<if .skills>>
    \section{Skills}
    <<range $type, $skills := .skills>>
        \begin{onecolentry}
            \textbf{<<escape_latex $type>>}
            \begin{highlights}
                <<range $index, $skill := $skills>>
                    \item \textbf{<<escape_latex $skill.name>>}<<if $skill.description>>: <<escape_latex $skill.description>><<end>> % <<if $skill.level>> - \textit{<<escape_latex $skill.level>>}<<end>>
                <<end>>
            \end{highlights}
        \end{onecolentry}
    <<end>>
    <<end>>
    
    <<if .certificates>>
    \section{Certifications}
    <<range .certificates>>
        \begin{twocolentry}{
        <<if .location>>
        \textit{<<escape_latex .location>>}    
        <<end>>
        <<if .granted_date>>
        \textit{<<escape_latex .granted_date>>}
        <<end>>
        }
            \textbf{<<escape_latex .name>>}
            <<if .issuer>>
            \textit{<<escape_latex .issuer>>}
            <<end>>
        \end{twocolentry}

        <<if .description>>
        \vspace{0.10 cm}
        \begin{onecolentry}
        	<<if .is_raw_latex>>
        	<<.description>>
        	<<else>>
        	\begin{highlights}
        	    <<range $index, $bullet := (split .description "\n")>>
        	    \item <<escape_latex $bullet>>
        	    <<end>>
        	\end{highlights}
        	<<end>>
        \end{onecolentry}
        <<end>>
        \vspace{0.2 cm}
    <<end>>
    <<end>>
\end{document}
`
