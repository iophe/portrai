package resumetemplates

import (
	"backend/lib/utils"
	"backend/sqlc_gen"
	"time"
)

// ConvertResumeToLatex_STANDARD_EXECUTIVE converts resume data, user info, and profile info to a LaTeX document
func ConvertResumeToLatex_STANDARD_EXECUTIVE(language string, resume_data utils.InputResumeData, user sqlc_gen.GetUserByIdRow, profile sqlc_gen.GetProfileByUserIdRow) (string, error) {
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
		return render_latex_document(template_data, "columns-executive", FR_RESUME_TEMPLATE)
	} else {
		return render_latex_document(template_data, "columns-executive", EN_RESUME_TEMPLATE)
	}
}

// LaTeX resume template
const EN_RESUME_TEMPLATE = `\documentclass[10pt, letterpaper]{article}

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
    pdftitle={Portrai_Resume_<<escape_latex .user.FullName>>},
    pdfauthor={ <<escape_latex .user.FullName>> },
    pdfcreator={Portrai},
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
    \begin{highlights}
        <<range $index, $skill := .skills>>
            \item \textbf{<<escape_latex $skill.name>>}<<if $skill.description>>: <<escape_latex $skill.description>><<end>> % <<if $skill.level>> - \textit{<<escape_latex $skill.level>>}<<end>>
        <<end>>
    \end{highlights}
    <<end>>

   <<if .languages>>
    \section{Languages}
    \begin{onecolentry}
        \begin{highlights}
            <<range $index, $language := .languages>>
                \item \textbf{<<escape_latex $language.name>>}<<if $language.level>> - \textit{<<escape_latex $language.level>>}<<end>><<if $language.description>> \textit{(<<escape_latex $language.description>>)}<<end>>
            <<end>>
        \end{highlights}
    \end{onecolentry}
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

const FR_RESUME_TEMPLATE = `\documentclass[10pt, letterpaper]{article}

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
    pdftitle={Portrai_Resume_<<escape_latex .user.FullName>>},
    pdfauthor={ <<escape_latex .user.FullName>> },
    pdfcreator={Portrai},
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
    \section{Profil}
    \begin{onecolentry}
        <<escape_latex .profile.Description>>
    \end{onecolentry}
    <<end>>
    
    <<if .experience>>
    \section{Experiences}
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
    \section{Éducations}
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
    \section{Projets}
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
    \section{Compétences}
    \begin{highlights}
        <<range $index, $skill := .skills>>
            \item \textbf{<<escape_latex $skill.name>>}<<if $skill.description>>: <<escape_latex $skill.description>><<end>> % <<if $skill.level>> - \textit{<<escape_latex $skill.level>>}<<end>>
        <<end>>
    \end{highlights}
    <<end>>

   <<if .languages>>
    \section{Langages}
    \begin{onecolentry}
        \begin{highlights}
            <<range $index, $language := .languages>>
                \item \textbf{<<escape_latex $language.name>>}<<if $language.level>> - \textit{<<escape_latex $language.level>>}<<end>><<if $language.description>> \textit{(<<escape_latex $language.description>>)}<<end>>
            <<end>>
        \end{highlights}
    \end{onecolentry}
    <<end>>

    <<if .certificates>>
    \section{Certificats}
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
