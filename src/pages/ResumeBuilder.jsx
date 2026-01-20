import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { dummyResumeData } from '../assets/assets'
import { ArrowLeftIcon, Briefcase, ChevronLeft, ChevronRight, DownloadIcon, EyeIcon, EyeOff, FileText, FolderIcon, GraduationCap, Share2Icon, Sparkles, User } 
from 'lucide-react'
import PersonalInfoForm from '../components/PersonalInfoForm'
import ResumePreview from '../components/ResumePreview'
import TemplateSelector from '../components/TemplateSelector'
import ColorPicker from '../components/ColorPicker'
import ProfessionalSummaryForm from '../components/ProfessionalSummaryForm'
import ExperienceForm from '../components/ExperienceForm'
import EducationForm from '../components/EducationForm'
import ProjectForm from '../components/ProjectForm'
import SkillForm from '../components/SkillForm'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast';

const ResumeBuilder = () => {
  const { resumeId } = useParams()
  const { token } = useSelector(state => state.auth)

  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [removeBackground, setRemoveBackground] = useState(false)
  const [resumeData, setResumeData] = useState({
    _id: '',
    title: '',
    personal_info: {},
    professional_summary: '',
    experience: [],
    education: [],
    projects: [],
    skills: [],
    template: 'classic',
    accent_color: '#3b82f6',
    public: false,
  })

  const loadexistingResume = async () => {
    try {
      const { data } = await api.get(`/api/resumes/get/` + resumeId, {headers: { Authorization: token }})
      if(data.resume){
        setResumeData(data.resume)
        document.title = data.resume.title
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(()=>{
    loadexistingResume()
  }, [])

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'summary', name: 'Professional Summary', icon: FileText },
    { id: 'experience', name: 'Experience', icon: Briefcase },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'projects', name: 'Projects', icon: FolderIcon },
    { id: 'skills', name: 'Skills', icon: Sparkles },
  ]

  const activeSection = sections[activeSectionIndex]

  const changeResumeVisibility = async () => {
    try {
      const formData = new FormData()
      formData.append('resumeId', resumeId)
      formData.append('resumeData', JSON.stringify({public: !resumeData.public}))
      const { data } = await api.put(`/api/resumes/update`, formData, {headers: { Authorization: token }})

      setResumeData({...resumeData, public: !resumeData.public})
      toast.success(data.message)
    } catch (error) {
      console.error("Error saving resume", error)
    }
  }

  const handleShare = () => {
    const frontendUrl = window.location.href.split('/app')[0]
    const resumeUrl = frontendUrl + '/view/' + resumeId

    if(navigator.share){
      navigator.share({ url: resumeUrl, text: 'My Resume', })
    }else{
      alert('share not supported on this browser. Copy the link: ' + resumeUrl)
    }
  }

  const downloadResume = () => {
    window.print();
  }

  const saveResume = async () => {
    try {
      let updatedResumeData = structuredClone(resumeData)

      //remove image from updatedresumedata
      if(typeof resumeData.personal_info.image === 'object'){
        delete updatedResumeData.personal_info.image
      }

      const formData = new FormData()
      formData.append('resumeId', resumeId)
      formData.append('resumeData', JSON.stringify(updatedResumeData))
      removeBackground && formData.append('removeBackground', 'true')
      typeof resumeData.personal_info.image === 'object' && formData.append('image', resumeData.personal_info.image)

      const { data } = await api.put('/api/resumes/update', formData, {headers: { Authorization: token }})

      setResumeData(data.resume)
      toast.success(data.message)
    } catch (error) {
      console.error("Error saving resume", error)
    }
  }

  return (
    <div>
      <div className='max-w-7xl mx-auto px-4 py-6'>
        <Link to='/app' className='inline-flex items-center gap-2 text-slate-500 
        hover:text-slate-700 transition-all'>
          <ArrowLeftIcon className='size-4'/> Back to Dashboard
        </Link>
      </div>

      <div className='max-w-7xl mx-auto px-4 pb-8'>
        <div className='grid lg:grid-cols-12 gap-8'>
          {/* left side - form */}
          <div className='relative lg:col-span-5 rounded-lg overflow-hidden'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1'>
              {/* progress bar using activesectionindex */}
              <hr className='absolute top-0 left-0 right-0 border-2 border-gray-200'/>
              <hr className='absolute top-0 left-0 h-1 bg-linear-to-r from-primary to-secondary 
              border-none transition-all duration-300' 
              style={{width: `${activeSectionIndex * 100 / (sections.length - 1)}%`}}/>
              {/* section nav */}
              <div className='flex justify-between items-center mb-6 border-b border-gray-300 py-1'>
                <div className='flex items-center gap-2'>
                  <TemplateSelector selectedTemplate={resumeData.template} onChange={(template)=> 
                    setResumeData(prev => ({...prev, template}))}/>

                  <ColorPicker selectedColor={resumeData.accent_color} onChange={(color)=> setResumeData(prev => ({...prev, 
                    accent_color: color}))}/>
                </div>


                <div className='flex items-center'>
                  {activeSectionIndex !== 0 && (
                    <button className='flex items-center gap-1 p-3 rounded-lg text-sm font-medium 
                    text-gray-600 hover:bg-gray-50 transition-all' disabled={activeSectionIndex === 0}
                    onClick={()=> setActiveSectionIndex((prevIndex) => Math.max(prevIndex - 1, 0))}>
                      <ChevronLeft className='size-4'/> Previous
                    </button>
                  )}
                  <button className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium 
                  text-gray-600 hover:bg-gray-50 transition-all ${activeSectionIndex 
                  === sections.length - 1 && 'opacity-50'}`} disabled={activeSectionIndex === sections.length - 1} 
                  onClick={()=> setActiveSectionIndex((prevIndex) => Math.min(prevIndex + 1, sections.length - 1))}>
                    Next <ChevronRight className='size-4'/>
                  </button> 
                </div>
              </div>
              {/* form content */}
              <div className='space-y-6'>
                {activeSection.id === 'personal' && (
                  <PersonalInfoForm data={resumeData.personal_info} onChange={(data)=> setResumeData(
                    prev => ({...prev, personal_info: data}))} removeBackground={removeBackground}
                    setRemoveBackground={setRemoveBackground}/>
                )}
                {activeSection.id === 'summary' && (
                  <ProfessionalSummaryForm data={resumeData.professional_summary} 
                  onChange={(data)=>setResumeData(prev=> ({...prev, professional_summary: data}))}
                  setResumeData={setResumeData}/>
                )}
                {activeSection.id === 'experience' && (
                  <ExperienceForm data={resumeData.experience}  
                  onChange={(data)=>setResumeData(prev=> ({...prev, experience: data}))}/>
                )}
                {activeSection.id === 'education' && (
                  <EducationForm data={resumeData.education}  
                  onChange={(data)=>setResumeData(prev=> ({...prev, education: data}))}/>
                )}
                {activeSection.id === 'projects' && (
                  <ProjectForm data={resumeData.projects}  
                  onChange={(data)=>setResumeData(prev=> ({...prev, projects: data}))}/>
                )}
                {activeSection.id === 'skills' && (
                  <SkillForm data={resumeData.skills}  
                  onChange={(data)=>setResumeData(prev=> ({...prev, skills: data}))}/>
                )}
              </div>
              <button onClick={() => {toast.promise(saveResume(), {loading: 'saving...'})}} className='bg-linear-to-br from-secondary/30 to-secondary/40 ring-secondary/20 text-secondary ring hover:ring-secondary/50 transition-all rounded-md px-6 py-2 mt-6 text-sm'>
                Save Changes
              </button>
            </div>
          </div>

          {/* right side - preview */}
          <div className='lg:col-span-7 max-lg:mt-6'>
            <div id="resume-preview" className='relative w-full'>
              {/* --- buttons --- */}
              <div className='absolute bottom-3 left-0 right-0 flex items-center justify-end gap-2'>
                {resumeData.public && (
                  <button onClick={handleShare} className='flex items-center gap-2 px-4 p-2 text-xs bg-linear-to-br from-primary/20 to-primary/50 text-primary rounded-lg ring-primary/80 hover:ring-primary/90 transition-color'>
                    <Share2Icon className='size-4'/> Share
                  </button>
                )}
                <button onClick={changeResumeVisibility} className='flex items-center gap-2 px-4 p-2 text-xs bg-linear-to-br from-secondary/20 to-secondary/50 text-secondary rounded-lg ring-secondary/80 hover:ring-secondary/90 transition-color'>
                  {resumeData.public ? <EyeIcon className='size-4'/> : <EyeOff className='size-4'/>}
                  {resumeData.public ? 'Public' : 'Private'}
                </button>
                <button onClick={downloadResume} className='flex items-center gap-2 px-4 p-2 text-xs bg-linear-to-br from-accent/20 to-accent/50 text-accent rounded-lg ring-accent/80 hover:ring-accent/90 transition-color'>
                  <DownloadIcon className='size-4'/> Download
                </button>
              </div>
            </div>

            {/* --- resume preview --- */}
            <ResumePreview data={resumeData} template={resumeData.template} 
            accentColor={resumeData.accent_color}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilder
