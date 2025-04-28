import { useNavigate, Navigator, A } from "@solidjs/router";
import LogoIcon from "@assets/icons/logo.svg?component-solid";
import AddIcon from "@assets/icons/add.svg?component-solid";
import HelpIcon from "@assets/icons/help.svg?component-solid";
import CommentIcon from "@assets/icons/notes.svg?component-solid";
import DocumentIcon from "@assets/icons/document.svg?component-solid";
import DangerIcon from "@assets/icons/danger.svg?component-solid";
import DownloadIcon from "@assets/icons/download.svg?component-solid";
import { Motion, Presence } from "solid-motionone";
import CloseIcon from "@assets/icons/close.svg?component-solid";
import {
	createContext,
	createEffect,
	createSignal,
	JSXElement,
	Match,
	on,
	onMount,
	Show,
	Switch,
	useContext,
} from "solid-js";
import { Portal } from "solid-js/web";

type TutorialType = "add-resume-item";

interface TutorialData {
	completed: boolean
	page : number
}

export type TutorialMetadata = {
	[key in TutorialType]: TutorialData
}

interface IntroPageProps {
	current_page : number
}

function IntroPage(props: IntroPageProps) {
	return (
		<section class="flex flex-col flex-wrap gap-4">
			<header>
				<h1 class="text-2xl">
					Welcolm to{" "}
					<span class="tracking-widest text-forest-800">
						PORTR
						<span class="alice-regular text-forest-600">AI</span>
					</span>{" "}
					!
				</h1>
			</header>
            <div class="youtube-video-container">
                <iframe
                    class="w-full min-h-80"
                    src={`https://www.youtube.com/embed/YcIbZGTRMjI`}
                    title="YouTube video player"
                    allowfullscreen
                ></iframe>
            </div>
			<article class="self-center flex flex-col gap-4 lg:max-w-prose">
				<section class="flex flex-col gap-2">
					<h2 class="text-xl text-lapis-800 font-bold">Transform Your Job Search with AI-Powered Resumes</h2>
					<p>
						Portrai is your secret weapon for landing more
						interviews. Our AI analyzes job descriptions and
						instantly creates perfectly tailored resumes that match
						exactly what employers are looking for.
					</p>
				</section>
				<section class="flex flex-col gap-2">
					<h2 class="text-xl text-lapis-800 font-bold">Your Complete Professional Identity</h2>
					<p>
						Build a comprehensive profile that showcases everything
						that makes you exceptional:
					</p>
					<ul class="list-disc pl-5">
						<li>
							<b class="text-forest-800">Professional Experiences</b> that highlight your
							achievements and impact
						</li>
						<li>
							<b class="text-forest-800">Educational Background</b> with degrees,
							coursework, and academic honors
						</li>
						<li>
							<b class="text-forest-800">Standout Projects</b> that demonstrate your
							skills in action
						</li>
						<li>
							<b class="text-forest-800">Diverse Skills</b> including technical abilities,
							soft skills, and languages
						</li>
						<li>
							<b class="text-forest-800">Professional Certifications</b> that validate
							your expertise
						</li>
					</ul>
					<p>
						Everything you add is securely stored and becomes the
						foundation for creating tailored applications that get
						noticed.
					</p>
				</section>
				<section class="flex flex-col gap-2">
					<h2 class="text-xl text-lapis-800 font-bold">Multiple Resume Versions Without the Hassle</h2>
					<p>
						Applying across different industries? Targeting
						international positions? Portrai has you covered:
					</p>
					<ul class="list-disc pl-5">
						<li>
							Create separate profiles for different career paths
						</li>
						<li>
							Maintain versions in multiple languages (English,
							French, Spanish, etc.)
						</li>
						<li>
							Tailor your experience for specific industries or
							roles
						</li>
						<li>Adapt to different regional resume standards</li>
					</ul>
					<p>
						Switch between versions with a single click—no more
						rebuilding your entire resume for each application!
					</p>
				</section>
				<section class="flex flex-col gap-2">
					<h2 class="text-xl text-lapis-800 font-bold">From Job Description to Perfect Resume</h2>
					<p>Here's where Portrai truly shines:</p>
					<ol class="list-decimal pl-5">
						<li>
							<b>Paste any job description</b>
						</li>
						<li>
							Our AI instantly analyzes key requirements and
							expectations
						</li>
						<li>
							We match your most relevant experiences and skills
							to the position
						</li>
						<li>
							Your perfectly tailored resume is generated in
							seconds
						</li>
						<li>
							Get a matching cover letter that makes you stand out
						</li>
						<li>
							Fine-tune everything through conversation with our
							AI assistant
						</li>
					</ol>
				</section>
				<section class="flex flex-col gap-2">
					<h2 class="text-xl text-lapis-800 font-bold">Professional Templates That Beat ATS Systems</h2>
					<p>
						Your brilliant content deserves a stunning presentation:
					</p>
					<ul class="list-disc pl-5">
						<li>
							Browse our collection of ATS-optimized templates
						</li>
						<li>
							Each design is tested to ensure it passes applicant
							tracking systems
						</li>
						<li>
							Clean, professional layouts that impress hiring
							managers
						</li>
						<li>
							Perfect formatting that makes your qualifications
							shine
						</li>
					</ul>
				</section>
				<section class="flex flex-col gap-2">
					<h2 class="text-xl text-lapis-800 font-bold">Standard Resumes When You Need Them</h2>
					<p>
						Not targeting a specific job? Create comprehensive
						standard resumes that:
					</p>
					<ul class="list-disc pl-5">
						<li>Showcase your full professional story</li>
						<li>Organize information for maximum impact</li>
						<li>
							Highlight your unique combination of skills and
							experiences
						</li>
					</ul>
				</section>
				<footer class="">
					<b class="text-forest-600">Ready to revolutionize your job search?</b> Let's get
					started with building your professional profile!
				</footer>
			</article>
		</section>
	);
}


interface FillProfilePageProps {
	current_page : number
}

function FillProfilePage(props: FillProfilePageProps) {
	return (
		<section class="flex flex-col flex-wrap gap-4">
			<header>
				<h1 class="text-2xl">
					How to Fill Your Profile
				</h1>
			</header>
            
			<article class="self-center flex flex-col gap-6 lg:max-w-prose">
				<section class="flex flex-col gap-2">
					<h2 class="text-xl text-lapis-800 font-bold">Step 1: Personal Information</h2>
					<p>
						Start by adding your personal details in the <A href="/account" onclick={() => {
							const tutorial_metadata_json = localStorage.getItem("tutorial-metadata") ?? "{}";
							const tutorial_metadata = JSON.parse(tutorial_metadata_json) as TutorialMetadata;
							
							tutorial_metadata["add-resume-item"] = {...tutorial_metadata["add-resume-item"], page:props.current_page}
							
							localStorage.setItem("tutorial-metadata", JSON.stringify(tutorial_metadata))
						}}><b class="text-forest-800">My Account</b></A> page:
					</p>
					<ul class="list-disc pl-5">
						<li>Your full name</li>
						<li>Email address (optional to share on resume)</li>
						<li>Phone number (optional to share on resume)</li>
					</ul>
					<p class="text-sm italic">
						Note: For privacy reasons, this information won't be shared with our AI assistant.
					</p>
				</section>

				<section class="flex flex-col gap-3">
					<h2 class="text-xl text-lapis-800 font-bold">Step 2: Build Your Professional Profile</h2>
					<div class="bg-forest-50 p-4 rounded-lg border border-forest-100">
						<h3 class="font-medium text-forest-800 mb-2">Professional Experiences</h3>
						<div class="flex flex-col gap-3">
							<p>Add your work history by following these steps:</p>
							<ol class="list-decimal pl-5">
								<li>Click the <span class="inline-flex items-center min-w-fit"><AddIcon /></span> button in the Professional Experiences section</li>
								<li>Fill out the form with your job details, responsibilities, and achievements</li>
								<li>Click <span class="bg-forest-900 px-2 py-0.5 rounded text-white font-medium">Submit</span> to save your experience</li>
							</ol>
							<div class="flex items-center gap-2 text-sm bg-gray-100 p-2 rounded">
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-forest-700">
									<circle cx="12" cy="12" r="10"></circle>
									<line x1="12" y1="16" x2="12" y2="12"></line>
									<line x1="12" y1="8" x2="12.01" y2="8"></line>
								</svg>
								<span>Remember to highlight accomplishments with measurable results when possible.</span>
							</div>
						</div>
					</div>

					<p class="font-medium">Repeat this process for each section of your profile:</p>
					
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="bg-forest-50 p-4 rounded-lg border border-forest-100">
							<h3 class="font-medium text-forest-800 mb-2">Educational Background</h3>
							<p class="text-sm">Add degrees, certifications, relevant coursework, and academic achievements.</p>
						</div>
						
						<div class="bg-forest-50 p-4 rounded-lg border border-forest-100">
							<h3 class="font-medium text-forest-800 mb-2">Projects</h3>
							<p class="text-sm">Showcase personal or professional projects that demonstrate your skills and expertise.</p>
						</div>
						
						<div class="bg-forest-50 p-4 rounded-lg border border-forest-100">
							<h3 class="font-medium text-forest-800 mb-2">Skills</h3>
							<p class="text-sm">List technical abilities, soft skills, languages, and proficiency levels.</p>
						</div>
						
						<div class="bg-forest-50 p-4 rounded-lg border border-forest-100">
							<h3 class="font-medium text-forest-800 mb-2">Certifications</h3>
							<p class="text-sm">Include professional certifications, licenses, and credentials relevant to your career.</p>
						</div>
					</div>
				</section>

				<section class="flex flex-col gap-2">
					<h2 class="text-xl text-lapis-800 font-bold">Step 3: Add Special Instructions</h2>
					<div class="flex items-start gap-3 bg-lapis-50 p-4 rounded-lg border border-lapis-100">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-lapis-700 flex-shrink-0 mt-1">
							<circle cx="12" cy="12" r="10"></circle>
							<path d="M12 16v-4"></path>
							<path d="M12 8h.01"></path>
						</svg>
						<div class="flex flex-col gap-2">
							<p class="font-medium text-lapis-800">Enhance Your Profile with Comments</p>
							<p>
								For each item in your resume, you can add special instructions or additional information:
							</p>
							<ul class="list-disc pl-5">
								<li>Click on any created item to edit it</li>
								<li>Look for the <span class="inline-flex items-center min-w-fit"><CommentIcon /></span> button</li>
								<li>Add context, special achievements, or preferences</li>
							</ul>
							<p class="italic text-sm">
								The more detailed information you provide, the better our AI assistant can tailor your resume to specific job applications.
							</p>
						</div>
					</div>
				</section>

				<section class="bg-forest-50 p-4 rounded-lg">
					<div class="flex flex-col gap-2">
						<h3 class="font-medium text-forest-900">Pro Tips:</h3>
						<ul class="list-disc pl-5">
							<li>Be specific and detailed about your accomplishments</li>
							<li>Include keywords relevant to your industry</li>
							<li>You can always edit or delete items later</li>
							<li>The more complete your profile, the better your AI-generated resumes will be</li>
						</ul>
					</div>
				</section>

				<footer class="text-center">
					<p class="font-medium text-forest-800">
						Ready to create a standout professional profile? Let's get started!
					</p>
				</footer>
			</article>
		</section>
	);
}

interface GenerateResumePageProps {
	current_page : number
}

function GenerateResumePage(props: GenerateResumePageProps) {
	return (
		<section class="flex flex-col flex-wrap gap-4">
			<header>
				<h1 class="text-2xl">
					How to Generate Your Perfect Resume
				</h1>
			</header>
            
			<article class="self-center flex flex-col gap-6 lg:max-w-prose">
				<section class="flex flex-col gap-2">
					<h2 class="text-xl text-lapis-800 font-bold">Step 1: Add a Job Description</h2>
					<div class="flex flex-col gap-3">
						<p>
							Start by finding a job posting you're interested in applying for:
						</p>
						<ol class="list-decimal pl-5">
							<li>Find a job offer on your favorite job search website (LinkedIn, Indeed, etc.)</li>
							<li>Copy the entire job description</li>
							<li>Paste it into the text area</li>
						</ol>
						<div class="bg-forest-50 p-4 rounded-lg border border-forest-100">
							<div class="flex items-center gap-2 mb-2">
								<span><DocumentIcon class="min-w-fit fill-forest-700"/></span>
								<h3 class="font-medium text-forest-800">Optional: Add Custom Instructions</h3>
							</div>
							<p class="text-sm">
								You can include additional guidance for the AI assistant if you want to emphasize certain aspects of your experience or skills for this particular job application.
							</p>
							<p class="text-sm mt-2 italic">
								Example: "Please highlight my project management skills and experience with cloud technologies for this position."
							</p>
						</div>
					</div>
				</section>

				<section class="flex flex-col gap-3">
					<h2 class="text-xl text-lapis-800 font-bold">Step 2: Generate Your Resume</h2>
					<div class="flex flex-col gap-3">
						<p>Once you've added the job description:</p>
						<ol class="list-decimal pl-5">
							<li>Click the <span class="bg-forest-900 px-2 py-0.5 rounded text-white font-medium">Generate Resume</span> button</li>
							<li>Wait approximately 25-30 seconds while our AI analyzes the job description and your profile</li>
							<li>Review your perfectly tailored resume that matches the job requirements</li>
						</ol>
						<div class="flex items-center gap-2 bg-gray-100 p-3 rounded">
							<span class="min-w-fit"><HelpIcon /></span>
							<span class="text-sm">During generation, our AI is matching your skills and experience to the specific requirements in the job description.</span>
						</div>
					</div>
				</section>

				<section class="flex flex-col gap-3">
					<h2 class="text-xl text-lapis-800 font-bold">Step 3: Refine Your Resume</h2>
					<p>
						Need to make adjustments to your generated resume? No problem:
					</p>
					<div class="bg-lapis-50 p-4 rounded-lg border border-lapis-100">
						<div class="flex items-start gap-3">
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-lapis-700 flex-shrink-0 mt-1">
								<path d="M12 20h9"></path>
								<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
							</svg>
							<div class="flex flex-col gap-2">
								<h3 class="font-medium text-lapis-800">Add Comments for Refinement</h3>
								<p class="text-sm">
									Use the comment feature to give feedback and request changes:
								</p>
								<ul class="list-disc pl-5 text-sm">
									<li>Click the comment icon on any section you want to modify</li>
									<li>Type your requested changes or feedback</li>
									<li>The AI will update that section based on your comments</li>
								</ul>
								<p class="text-sm italic mt-1">
									Example comments: "Can you make this bullet point more concise?" or "Please add more details about my leadership experience in this role."
								</p>
							</div>
						</div>
					</div>
				</section>

				<section class="flex flex-col gap-3">
					<h2 class="text-xl text-lapis-800 font-bold">Step 4: Generate a Cover Letter</h2>
					<p>
						Complete your application with a matching cover letter:
					</p>
					<div class="bg-forest-50 p-4 rounded-lg border border-forest-100">
						<ol class="list-decimal pl-5">
							<li>Click the <span class="bg-forest-900 px-2 py-0.5 rounded text-white font-medium">Generate Cover Letter</span> button</li>
							<li>Add any specific instructions if needed (optional)</li>
							<li>Wait approximately 25-30 seconds for generation</li>
							<li>Review your personalized cover letter</li>
						</ol>
						<p class="text-sm mt-2">
							Just like with your resume, you can add comments to refine your cover letter until it's perfect.
						</p>
					</div>
				</section>

				<section class="flex flex-col gap-3">
					<h2 class="text-xl text-lapis-800 font-bold">Step 5: Download Your Documents</h2>
					<p>
						Ready to apply? Download your perfectly tailored documents:
					</p>
					<div class="flex items-center gap-3 bg-gray-100 p-4 rounded-lg">
						<span><DownloadIcon class="min-w-fit fill-forest-600"/></span>
						<p>
							Click the <span class="bg-forest-900 px-2 py-0.5 rounded text-white font-medium">Download PDF</span> button to save your resume and/or cover letter.
						</p>
					</div>
				</section>

				<section class="flex flex-col gap-3">
					<h2 class="text-xl text-lapis-800 font-bold">Accessing Your Resume History</h2>
					<div class="flex flex-col gap-2">
						<p>
							All your generated resumes are saved for future reference:
						</p>
						<ul class="list-disc pl-5">
							<li>Visit the <b class="text-forest-800">History</b> page to see all your previously generated resumes</li>
							<li>You can view, edit, or download any resume from your history</li>
						</ul>
						<div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-1">
							<div class="flex items-start gap-2">
								<span><DangerIcon class="min-w-fit fill-yellow-600"/></span>
								<div>
									<h3 class="font-medium text-yellow-800">Important Privacy Note</h3>
									<p class="text-sm text-yellow-700 mt-1">
										For privacy reasons, your resumes are stored locally on your device only. They will not be accessible from other devices and will be deleted if you log out. Please download important resumes before logging out.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				<footer class="text-center pt-2">
					<p class="font-medium text-forest-800">
						Ready to create your perfectly tailored resume? Let's get started!
					</p>
				</footer>
			</article>
		</section>
	);
}

interface TUTORIAL_AddResumeViewProps {
	data?: TutorialData;
	close: () => void;
}

export function TUTORIAL_AddResumeView(props: TUTORIAL_AddResumeViewProps) {
	const [current_page, set_current_page] = createSignal(props.data?.page ?? 0);
	const Pages = [<IntroPage current_page={0}/>,<FillProfilePage current_page={1}/>,<GenerateResumePage current_page={2}/>];
	return (
		<section class="overflow-hidden lg:max-h-full flex flex-col gap-4 bg-white lg:p-8 p-4 rounded lg:w-3/4 w-full shadow-xl border border-lapis-100 ">
			<button class="self-end" onclick={() => props.close()}>
				<CloseIcon class="min-w-fit fill-forest-900" />
			</button>
            <section class="grow overflow-auto h-full">
                <Switch>
                    <Match when={current_page() === 0}>{Pages[0]}</Match>
                    <Match when={current_page() === 1}>{Pages[1]}</Match>
                    <Match when={current_page() === 2}>{Pages[2]}</Match>
                </Switch>
            </section>
			<section class="flex flex-col items-center gap-4 w-full">
				<div class="flex flex-row gap-4 w-full justify-end">
					<Show when={current_page() !== 0}>
						<button
							onclick={() => {
								set_current_page(
									(prev) => (prev - 1) % Pages.length
								)

								const tutorial_metadata_json = localStorage.getItem("tutorial-metadata") ?? "{}";
								const tutorial_metadata = JSON.parse(tutorial_metadata_json) as TutorialMetadata;
								
								tutorial_metadata["add-resume-item"] = {...tutorial_metadata["add-resume-item"], page:current_page()}
								
								localStorage.setItem("tutorial-metadata", JSON.stringify(tutorial_metadata))
							}
							}
							class="py-2 px-4 w-fit border border-lapis-400 rounded"
						>
							Previous
						</button>
					</Show>
					<Show when={current_page() !== Pages.length - 1}>
						<button
							onclick={() => {
								set_current_page(
									(prev) => (prev + 1) % Pages.length
								)

								const tutorial_metadata_json = localStorage.getItem("tutorial-metadata") ?? "{}";
								const tutorial_metadata = JSON.parse(tutorial_metadata_json) as TutorialMetadata;
								
								tutorial_metadata["add-resume-item"] = {...tutorial_metadata["add-resume-item"], page:current_page()}
								
								localStorage.setItem("tutorial-metadata", JSON.stringify(tutorial_metadata))
							}
							}
							class="py-2 px-4 w-fit bg-lapis-400 rounded text-white"
						>
							Next
						</button>
					</Show>
					<Show when={current_page() === Pages.length - 1}>
						<button
							onclick={() => {
								const tutorial_metadata_json = localStorage.getItem("tutorial-metadata") ?? "{}";
								const tutorial_metadata = JSON.parse(tutorial_metadata_json) as TutorialMetadata;
								
								tutorial_metadata["add-resume-item"] = {...props.data ?? tutorial_metadata["add-resume-item"], completed:true}
								
								localStorage.setItem("tutorial-metadata", JSON.stringify(tutorial_metadata))
								props.close();
							}}
							class="py-2 px-4 w-fit bg-lapis-400 rounded text-white"
						>
							Let's Start
						</button>
					</Show>
				</div>
				<button onclick={() => {
					const tutorial_metadata_json = localStorage.getItem("tutorial-metadata") ?? "{}";
					const tutorial_metadata = JSON.parse(tutorial_metadata_json) as TutorialMetadata;
					
					tutorial_metadata["add-resume-item"] = {...props.data ?? tutorial_metadata["add-resume-item"], completed:true}
					
					localStorage.setItem("tutorial-metadata", JSON.stringify(tutorial_metadata))
					props.close()
				}} class="underline">
					Skip this tutorial
				</button>
			</section>
		</section>
	);
}


class TutorialEvent extends Event {
	data?: TutorialData;
	kind: TutorialType;
	constructor(type: string, kind: TutorialType, data?: TutorialData) {
		super(type);
		this.data = data;
		this.kind = kind;
	}

	static SHOW(kind: TutorialType, data?: TutorialData) {
		return new TutorialEvent("show", kind, data);
	}
}

export class TutorialTarget extends EventTarget {
	constructor() {
		super();
	}

	show(kind: TutorialType, data?: TutorialData) {
		this.dispatchEvent(TutorialEvent.SHOW(kind, data));
	}
}

export const TutorialContext = createContext<TutorialTarget>();
export function useTutorial<T = TutorialTarget>() {
	return useContext(TutorialContext) as T;
}

interface TutorialProviderProps {
	children?: JSXElement;
}

export function TutorialProvider(props: TutorialProviderProps) {
	const tutorial = new TutorialTarget();
	const navigate = useNavigate();
	return (
		<TutorialContext.Provider value={tutorial}>
			{props.children}
			<TutorialHandler navigate={navigate} />
		</TutorialContext.Provider>
	);
}

export type TutorialHandlerProps = {
	navigate: Navigator;
};

export function TutorialHandler(props: TutorialHandlerProps) {
	const tutorial = useTutorial();
	const [tutorial_view_is_shown, show_tutorial_view] = createSignal(false);
	const [tutorial_type, set_tuturial_type] = createSignal<
		TutorialType | undefined
	>(undefined);
	const [tutorial_data, set_tuturial_data] = createSignal<
		TutorialData | undefined
	>(undefined);

	tutorial.addEventListener("show", (event) => {
		show_tutorial_view(true);
		set_tuturial_type((event as TutorialEvent).kind);
		set_tuturial_data((event as TutorialEvent).data);
	});
    let ref : HTMLDivElement | undefined;

    createEffect(on(tutorial_view_is_shown,() => {
        if (!ref) return;
        
		setTimeout(() => {
			if (ref.clientHeight <= document.getElementById('root')!.clientHeight) {
				ref.style.height = document.getElementById('root')!.clientHeight.toString()+"px";
			}
		}, 100)
    }))

	return (
		<Portal>
			<Show when={tutorial_view_is_shown()}>
                    <Motion.div
                        ref={ref}
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(2px)" }}
                        transition={{ duration: 0.1, easing: "ease-in-out" }}
                        class="absolute inset-0 z-50 p-4 py-16 flex items-center justify-center w-full min-h-max h-max lg:h-full lg:max-h-screen lg:overflow-hidden"
                    >
                        <Switch>
                            <Match when={tutorial_type() === "add-resume-item"}>
                                <TUTORIAL_AddResumeView
                                    data={tutorial_data()}
                                    close={() => {
                                        show_tutorial_view(false);
                                        set_tuturial_type(undefined);
                                        set_tuturial_data(undefined);
                                    }}
                                />
                            </Match>
                        </Switch>
                    </Motion.div>
			</Show>
		</Portal>
	);
}
