import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyResumeData } from '../assets/assets'
import ResumePreview from '../components/ResumePreview'
import Loader from '../components/Loader'
import { ArrowLeft } from 'lucide-react'

const Preview = () => {
  const { resumeId } = useParams()
  const [resumeData, setResumeData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchResume = async () => {
    setResumeData(dummyResumeData.find(resume => resume._id === resumeId || null))
    setLoading(false)
  }

  useEffect(() => {
    fetchResume()
  }, [])
  return (
    <div>
      {resumeData ? (
        <div className='bg-slate-100'>
          <div className='max-w-3xl mx-auto py-10'>
            <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color} classes='py-4 bg-white'/>
          </div>
        </div>
      ) : (
        <div>
          {loading ? <Loader/> : (
            <div className='flex flex-col items-center justify-center h-screen'>
              <p className='text-center text-6xl text-slate-400 font-medium'>Resume Not Found</p>
              <a href="/" className='mt-6 flex items-center py-2 bg-primary text-white rounded-full px-6 h-9 m-1 ring-offset-1 ring ring-primary/70 transition-colors hover:bg-primary/90'>
                <ArrowLeft className='size-4 mr-2'/> Go to home page
              </a>
            </div>
          )}
        </div>
      )
      }
    </div>
  )
}

export default Preview
