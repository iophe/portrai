// @ts-ignore

import { Motion, Presence } from '@motionone/solid'
import Header from "../../components/header.default";
import { For, createEffect, createSignal, onCleanup } from "solid-js";

interface LandingProps {}

const jobDescriptionSteps = [
	"We are seeking a Senior Software Engineer with 5+ years of experience in React...",
	"Strong background in cloud technologies and microservices...",
	"Experience with agile methodologies and team leadership..."
  ];
  
  const features = [
	"Keyword optimization for ATS systems",
	"Skills matching with job requirements",
	"Industry-specific language adaptation"
  ];
  
  export function JobMatchingSection() {
	const [isAnalyzing, setIsAnalyzing] = createSignal(false);
	const [showPreview, setShowPreview] = createSignal(false);
  
	// Fonction pour gérer le cycle complet d'animation
	const runAnimationCycle = () => {
	  setIsAnalyzing(true);
	  
	  setTimeout(() => {
		setIsAnalyzing(false);
		setShowPreview(true);
		
		// Reset après 4 secondes pour recommencer le cycle
		setTimeout(() => {
		  setShowPreview(false);
		  // Petit délai avant de recommencer
		  setTimeout(() => runAnimationCycle(), 1000);
		}, 4000);
	  }, 2000);
	};
  
	// Démarrer le cycle d'animation dès le montage du composant
	createEffect(() => {
	  const timer = setTimeout(runAnimationCycle, 1000);
	  
	  // Cleanup au démontage
	  onCleanup(() => {
		clearTimeout(timer);
	  });
	});
  
	return (
	  <div class="mt-32 max-w-6xl mx-auto">
		<div class="grid grid-cols-2 gap-16 items-center">
		  <Motion.div
			initial={{ opacity: 0, x: -50 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.6 }}
			class="space-y-8"
		  >
			<h2 class="text-4xl font-bold text-[#01200F]">
			  Perfect Match with 
			  <Motion.span
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				class="block mt-2 text-[#6EEB83]"
			  >
				AI-Powered Tailoring
			  </Motion.span>
			</h2>
			
			<p class="text-xl text-gray-600">
			  Simply paste the job description, and our AI will analyze key requirements to create a perfectly tailored resume that maximizes your chances of being hired.
			</p>
  
			<div class="flex flex-col gap-6">
			  <For each={features}>
				{(feature, index) => (
				  <Motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.4 + index() * 0.1 }}
					class="flex items-center gap-4 text-lg group"
				  >
					<div class="w-8 h-8 rounded-full bg-[#6EEB83] flex items-center justify-center text-[#01200F] font-bold">
					  ✓
					</div>
					<span>{feature}</span>
				  </Motion.div>
				)}
			  </For>
			</div>
		  </Motion.div>
  
		  <Motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.6 }}
		  >
			<div class="relative">
			  <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
				<div class="space-y-6">
				  <div>
					<div class="text-sm font-medium text-gray-500 mb-2">Job Description</div>
					<div class="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[200px] relative overflow-hidden">
					  <Motion.div
						animate={{
						  backgroundColor: isAnalyzing() ? 'rgba(110, 235, 131, 0.1)' : 'rgb(249, 250, 251)'
						}}
						transition={{ duration: 0.5 }}
						class="absolute inset-0"
					  />
  
					  <For each={jobDescriptionSteps}>
						{(step, index) => (
						  <Motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 + index() * 0.1 }}
							class="flex items-start gap-3 mb-4 relative z-10"
						  >
							<div class="w-4 h-4 rounded-full bg-[#6EEB83] mt-1"></div>
							<p class="text-gray-600">{step}</p>
						  </Motion.div>
						)}
					  </For>
					</div>
				  </div>
  
				  {isAnalyzing() && (
					<Motion.div
					  initial={{ opacity: 0, y: 20 }}
					  animate={{ opacity: 1, y: 0 }}
					  class="flex items-center gap-4"
					>
					  <div class="h-12 w-12 rounded-full bg-[#01200F] flex items-center justify-center animate-spin">
						<svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
						  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
						</svg>
					  </div>
					  <div>
						<div class="font-medium">AI Analysis</div>
						<div class="text-sm text-gray-500">Extracting key requirements...</div>
					  </div>
					</Motion.div>
				  )}
  
				  {showPreview() && (
					<Motion.div
					  initial={{ opacity: 0, y: 20 }}
					  animate={{ opacity: 1, y: 0 }}
					>
					  <div class="text-sm font-medium text-gray-500 mb-2">Tailored Resume Preview</div>
					  <div class="p-4 bg-[#01200F] bg-opacity-5 rounded-lg border border-[#01200F] border-opacity-10">
						<div class="space-y-3">
						  <Motion.div
							initial={{ width: 0 }}
							animate={{ width: '75%' }}
							transition={{ duration: 0.5 }}
							class="h-4 bg-[#6EEB83] bg-opacity-20 rounded"
						  />
						  <Motion.div
							initial={{ width: 0 }}
							animate={{ width: '50%' }}
							transition={{ duration: 0.5, delay: 0.1 }}
							class="h-4 bg-[#6EEB83] bg-opacity-20 rounded"
						  />
						  <Motion.div
							initial={{ width: 0 }}
							animate={{ width: '66%' }}
							transition={{ duration: 0.5, delay: 0.2 }}
							class="h-4 bg-[#6EEB83] bg-opacity-20 rounded"
						  />
						</div>
					  </div>
					</Motion.div>
				  )}
				</div>
			  </div>
			  <div class="absolute -bottom-4 -right-4 w-full h-full border-2 border-[#01200F] rounded-2xl"></div>
			</div>
		  </Motion.div>
		</div>
	  </div>
	);
  }

function Landing(props: LandingProps) {
    return (
        <div class="min-h-screen bg-white">
          {/* Navigation élégante */}
          <nav class="w-full py-6 px-8 flex justify-between items-center bg-white border-b border-gray-100">
            <div class="text-2xl font-bold text-[#01200F]">PORTRAI</div>
            <div class="flex gap-8 items-center">
              <a href="#" class="text-gray-700 hover:text-[#01200F] transition-colors">About Us</a>
              <a href="#" class="text-gray-700 hover:text-[#01200F] transition-colors">Blog</a>
              <a href="#" class="text-gray-700 hover:text-[#01200F] transition-colors">Pricing</a>
              <a href="#" class="bg-[#01200F] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all">
                Get started
              </a>
            </div>
          </nav>
    
          {/* Hero Section */}
          <main class="container mx-auto px-4 pt-24">
		  <div class="flex justify-between items-center gap-16">
          <div class="flex-1 space-y-10">
            <h1 class="text-6xl font-bold leading-tight text-[#01200F]">
              Create your dream resume 
              <span class="block mt-2">with <span class="text-[#6EEB83]">AI precision</span></span>
            </h1>
            
            <p class="text-xl text-gray-600 max-w-2xl">
              Generate professional resumes and cover letters tailored to your dream job in 4 simple steps
            </p>

            <div class="space-y-8 py-8 border-l-2 border-[#6EEB83] pl-8">
              <div class="relative">
                <div class="absolute -left-[42px] w-5 h-5 rounded-full bg-[#6EEB83]" />
                <p class="text-lg">Describe yourself to your AI assistant</p>
              </div>
              <div class="relative">
                <div class="absolute -left-[42px] w-5 h-5 rounded-full bg-[#6EEB83]" />
                <p class="text-lg">Insert the job offer of your dream</p>
              </div>
              <div class="relative">
                <div class="absolute -left-[42px] w-5 h-5 rounded-full bg-[#6EEB83]" />
                <p class="text-lg">Choose the perfect template</p>
              </div>
              <div class="relative">
                <div class="absolute -left-[42px] w-5 h-5 rounded-full bg-[#6EEB83]" />
                <p class="text-lg">Download a tailor made resume and cover letter</p>
              </div>
            </div>

            <button class="bg-[#01200F] text-white px-8 py-4 rounded-lg text-lg font-medium inline-flex items-center gap-3 hover:shadow-lg transition-all group">
              Try it now
              <span class="group-hover:translate-x-2 transition-transform">→</span>
            </button>
          </div>

          <div class="flex-1">
            <div class="relative aspect-square max-w-lg">
              <div class="w-full h-full bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl border border-gray-100" />
              <div class="absolute -bottom-4 -right-4 w-full h-full border-2 border-[#01200F] rounded-2xl" />
            </div>
          </div>
        </div>

		<JobMatchingSection />

        {/* Success Rate Section */}
        <div class="mt-32">
          <div class="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h3 class="text-4xl font-bold text-[#01200F]">
              Maximize Your <span class="text-[#6EEB83]">Success Rate</span>
            </h3>
            <p class="text-xl text-gray-600">
              Our AI-powered tailoring system significantly increases your chances of landing interviews
            </p>
          </div>
          
          <div class="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div class="text-center space-y-4">
              <div class="text-4xl font-bold text-[#01200F]">85%</div>
              <p class="text-gray-600">Higher response rate from recruiters</p>
            </div>
            <div class="text-center space-y-4">
              <div class="text-4xl font-bold text-[#01200F]">3x</div>
              <p class="text-gray-600">More likely to get an interview</p>
            </div>
            <div class="text-center space-y-4">
              <div class="text-4xl font-bold text-[#01200F]">92%</div>
              <p class="text-gray-600">ATS pass-through rate</p>
            </div>
          </div>
        </div>
    
            {/* Section Création de profil */}
            <section class="mt-32 space-y-16">
              <div class="text-center max-w-3xl mx-auto space-y-4">
                <h2 class="text-4xl font-bold text-[#01200F]">
                  Create your <span class="text-[#6EEB83]">professional profile</span>
                </h2>
                <p class="text-xl text-gray-600">Build your career story with our intelligent assistant</p>
              </div>
              
              {/* Formulaire élégant */}
              <div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
                <h3 class="text-2xl font-bold mb-8 text-[#01200F]">Professional Experience</h3>
                <div class="space-y-6">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-600">Position Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Senior Developer"
                      class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6EEB83] focus:border-transparent transition-all" 
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-600">Company</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Tech Innovations Inc"
                      class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6EEB83] focus:border-transparent transition-all" 
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-600">Time Period</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Jan 2020 - Present"
                      class="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6EEB83] focus:border-transparent transition-all" 
                    />
                  </div>
                </div>
              </div>
    
              {/* Templates Section */}
              <div class="mt-32">
                <div class="text-center max-w-3xl mx-auto space-y-4 mb-16">
                  <h3 class="text-4xl font-bold text-[#01200F]">
                    Premium <span class="text-[#6EEB83]">ATS-friendly</span> templates
                  </h3>
                  <p class="text-xl text-gray-600">
                    Stand out with our professionally designed templates
                  </p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {[1, 2, 3].map((template) => (
                    <div class="bg-white rounded-xl shadow-lg p-8 border border-gray-100 group hover:shadow-xl transition-all">
                      <div class="aspect-[3/4] bg-gradient-to-br from-gray-50 to-white rounded-lg mb-6 group-hover:shadow-md transition-all" />
                      <h4 class="font-medium text-lg text-[#01200F]">Modern Professional</h4>
                      <p class="text-gray-600 mt-2">Clean and contemporary design for tech and creative roles</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </div>
      )
	;
}

export default Landing;
