package main

import (
	"bytes"
	"fmt"
	"io"
	"log/slog"
	"mime/multipart"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt"
	"github.com/google/uuid"
)

var KONG_AUTH_HOST = os.Getenv("KONG_AUTH_HOST")
var KONG_AUTH_PORT = os.Getenv("KONG_AUTH_PORT")
var SERVICE_ROLE_KEY = os.Getenv("SERVICE_ROLE_KEY")
var JWT_SECRET = os.Getenv("JWT_SECRET")
var KONG_STORAGE_URL = fmt.Sprintf("http://%s:%s/storage/v1", KONG_AUTH_HOST, KONG_AUTH_PORT)

var BUCKET_NAME = "latex"

func main() {
	app := fiber.New()

	port, err := strconv.Atoi(os.Getenv("PORT"))
	if err != nil {
		port = 3780
		slog.Warn("invalid port found in env, expected a valid positive integer, defaulting to 3780", "err", err)
	}

	api_group := app.Group("/api")
	v1_group := api_group.Group("/v1")

	RegisterRoutes(v1_group)

	err = app.Listen(fmt.Sprintf(":%d", port))
	if err != nil {
		panic(fmt.Sprintf("cannot start server: %s", err))
	}
}

func RegisterRoutes(api fiber.Router) {
	RegisterLatexRoutes(api)
}
func RegisterLatexRoutes(api fiber.Router) {
	latex_group := api.Group("latex")

	latex_group.Post("/generate", func(c *fiber.Ctx) error {
		var data LatexPDFGenerationData
		if err := c.BodyParser(&data); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}
		return HandleLatexPDFGeneration(data, c)
	})

	latex_group.Get("/test", func(c *fiber.Ctx) error {
		var data LatexPDFGenerationData
		data.FileID = uuid.New().String()
		data.Filename = "test.pdf"
		data.LatexFile = `
\documentclass[10pt, letterpaper]{article}

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
    pdftitle={ My Name's CV},
    pdfauthor={ My Name },
    pdfcreator={LaTeX with RenderCV},
    colorlinks=true,
    urlcolor=primaryColor
]{hyperref} % for links, metadata and bookmarks
\usepackage[pscoord]{eso-pic} % for floating text on the page
\usepackage{calc} % for calculating lengths
\usepackage{bookmark} % for bookmarks
\usepackage{lastpage} % for getting the total number of pages
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
        \small\color{gray}\textit{Last updated in March 2025}\hspace{\widthof{Last updated in March 2025 } }
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
        \textbf{\fontsize{24 pt}{24 pt}\selectfont My Name}

        \vspace{0.3 cm}

        \normalsize
        \mbox{{\color{black}\footnotesize\faMapMarker*}\hspace*{0.13cm}London, UK}%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%
        \mbox{\hrefWithoutArrow{mailto:myemail@email.com}{\color{black}{\footnotesize\faEnvelope[regular]}\hspace*{0.13cm}myemail@email.com } }%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%
        \mbox{
			\hrefWithoutArrow{
				tel:+44 20 7123 4567}
				{\color{black}{\footnotesize\faPhone*}\hspace*{0.13cm}+44 20 7123 4567
			}
		}%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%
        \mbox{\hrefWithoutArrow{http://willem.com}{\color{black}{\footnotesize\faLink}\hspace*{0.13cm}http://willem.com } }%
        \kern 0.25 cm%
        \AND%
        \kern 0.25 cm%
        \mbox{\hrefWithoutArrow{http://linkedin.com/willem}{\color{black}{\footnotesize\faLinkedinIn}\hspace*{0.13cm}http://linkedin.com/willem } }%
        \kern 0.25 cm%
    \end{header}

    \vspace{0.3 cm - 0.3 cm}

    
    \section{Profile}
    \begin{onecolentry}
        Highly motivited Software Engineer with a great passion for sofware design and architecture
    \end{onecolentry}
    

    
    \section{Education}
    
        \begin{twocolentry}{
        
        \textit{Toulouse, France}    
        
        
        \textit{Sep 2022 – Sep 2023}
        
        }
            \textbf{Toulouse INP-ENSEEIHT}
            
            \textit{Master - Research Diploma}
            
        \end{twocolentry}

        
        \vspace{0.10 cm}
        \begin{onecolentry}
            \begin{highlights}
                \item Dual master at ENSEEIHT in performance in software, media \& scientific computing
            \end{highlights}
        \end{onecolentry}
        
        \vspace{0.2 cm}
    
        \begin{twocolentry}{
        
        \textit{Toulouse, France}    
        
        
        \textit{Sep 2020 – Sep 2023}
        
        }
            \textbf{Toulouse INP-ENSEEIHT}
            
            \textit{Master - Engineering Diploma}
            
        \end{twocolentry}

        
        \vspace{0.10 cm}
        \begin{onecolentry}
            \begin{highlights}
                \item Software System \& Computer science program at ENSEEIHT one of the most prestigious French engineering
schools in the Computer Science field.
            \end{highlights}
        \end{onecolentry}
        
        \vspace{0.2 cm}
    
    
    
    
    \section{Experience}
    
        \begin{twocolentry}{
        
        \textit{Bristol, England}    
        
        
        \textit{Apr 2023 – Sep 2023}
        
        }
            \textbf{Software Engineer}
            
            \textit{University of Brisol}
            
        \end{twocolentry}

        
        \vspace{0.10 cm}
        \begin{onecolentry}
            \begin{highlights}
                \item I participated in a project with climate researchers at the University of Bristol, namely the Climate Archive at https://climatearchive.org/ . The project involved the development of an automated workflow for data processing and a user-friendly web application for 3D visualisation of large global climate model datasets. Various technologies were used for the project, such as the programming languages GOlang, Typescript and Python, the frameworks React and Nextjs and the database PostgreSQL.
            \end{highlights}
        \end{onecolentry}
        
        \vspace{0.2 cm}
    
        \begin{twocolentry}{
        
        \textit{Toulouse, France}    
        
        
        \textit{Sep 2023 – Present}
        
        }
            \textbf{Software engineer}
            
            \textit{CS group}
            
        \end{twocolentry}

        
        \vspace{0.10 cm}
        \begin{onecolentry}
            \begin{highlights}
                \item As a Software Engineer in the EGNOS project,I develop embedded real-time software to ensure the safety and integrity of GPS and Galileo data. My role involves real-time and concurrent computing in C. Managing all aspects of the software lifecycle,I follow the V-cycle development model to deliver high-quality and secure software solutions.

            \end{highlights}
        \end{onecolentry}
        
        \vspace{0.2 cm}
    
    
    
    
    
    
    \section{Skills}
    
        \begin{onecolentry}
            \textbf{Technical}
            \begin{highlights}
                
                    \item \textbf{Programing}: Rust - Golang - Java - Python - C - Ada - Javascript/Typescrypt - HTML/CSS - SQL - OCaml - Shell - Kotlin -
Flutter- PHP - Docker- Git - Jenkins - \textit{Proficient}
                
            \end{highlights}
        \end{onecolentry}
    
    
    
    
\end{document}

 `

		return HandleLatexPDFGeneration(data, c)
	})
}

type LatexPDFGenerationData struct {
	LatexFile string `json:"latex_file"`
	FileID    string `json:"file_id"`
	Filename  string `json:"file_name"`
	Store     bool   `json:"store"`
}

func HandleLatexPDFGeneration(data LatexPDFGenerationData, c *fiber.Ctx) error {
	if data.LatexFile == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "latex_file is required",
		})
	}

	temp_dir, err := os.MkdirTemp("", "latex-*")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create temporary directory",
		})
	}
	defer os.RemoveAll(temp_dir)

	tex_file_path := filepath.Join(temp_dir, data.FileID+".tex")
	if err := os.WriteFile(tex_file_path, []byte(data.LatexFile), 0644); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to write LaTeX file",
		})
	}

	// Run pdflatex to generate PDF
	cmd := exec.Command("pdflatex", "-interaction=nonstopmode", "-output-directory="+temp_dir, tex_file_path)
	var stderr bytes.Buffer
	var stdout bytes.Buffer
	cmd.Stderr = &stderr
	cmd.Stdout = &stdout

	if err := cmd.Run(); err != nil {
		slog.Error(stdout.String())
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":  "LaTeX compilation failed: " + stderr.String(),
			"stderr": stderr.String(),
			"stdout": stdout.String(),
		})
	}

	// Path to the generated PDF
	pdf_file_path := strings.TrimSuffix(tex_file_path, ".tex") + ".pdf"
	if _, err := os.Stat(pdf_file_path); os.IsNotExist(err) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "PDF file was not generated",
		})
	}
	// Read the PDF file
	pdf_data, err := os.ReadFile(pdf_file_path)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to read generated PDF",
		})
	}

	if data.Store {

		// Create buffer for multipart form data
		var request_body bytes.Buffer
		multipart_writer := multipart.NewWriter(&request_body)

		file_part, err := multipart_writer.CreateFormFile("file", data.FileID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create form file: " + err.Error(),
			})
		}

		if _, err = io.Copy(file_part, bytes.NewReader(pdf_data)); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to copy PDF data: " + err.Error(),
			})
		}

		if err = multipart_writer.Close(); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to close multipart writer: " + err.Error(),
			})
		}

		request, err := http.NewRequest("POST",
			fmt.Sprintf("%s/object/%s/%s",
				KONG_STORAGE_URL, BUCKET_NAME, data.FileID),
			&request_body,
		)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create HTTP request: " + err.Error(),
			})
		}
		request.Header.Set("Content-Type", multipart_writer.FormDataContentType())
		request.Header.Set("x-upsert", "true")
		claims := jwt.MapClaims{
			"role": "service_role",
			"iss":  "supabase",
			"iat":  time.Now().Unix(),
			"exp":  time.Now().Add(time.Hour).Unix(), // Token valid for 1 hour
		}

		// Create the token with the claims
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

		bearer, err := token.SignedString([]byte(JWT_SECRET))
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to authorized file storage: " + err.Error(),
			})
		}
		request.Header.Set("Authorization", fmt.Sprintf("Bearer %s", bearer))
		request.Header.Set("apikey", SERVICE_ROLE_KEY)

		client := &http.Client{}
		response, err := client.Do(request)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "failed to store pdf",
			})
		}
		defer response.Body.Close()

		if response.StatusCode != http.StatusOK {
			body_bytes, err := io.ReadAll(response.Body)
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error":   "failed to read response body",
					"details": err.Error(),
				})
			}
			body_string := string(body_bytes)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error":   "failed to store pdf",
				"details": body_string,
			})
		}
		return c.SendStatus(fiber.StatusOK)
	} else {
		c.Set("Content-Type", "application/pdf")
		return c.Send(pdf_data)
	}
}
