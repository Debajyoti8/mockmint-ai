import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteInterviewReport } from "@/features/interview/services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "@/context/InterviewContext"
import { useParams } from "react-router"

export const useInterview = () => {
    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }

        return response?.interviewReport
    }

    const getReportById = async (id) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(id)
            setReport(response.interviewReport)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
        return response?.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }

        return response?.interviewReports
    }

    const deleteReport = async (id) => {
        setLoading(true)
        try {
            await deleteInterviewReport(id)
            setReports((prev) => prev.filter((r) => r._id !== id))
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const getResumePdf = async (id) => {
        setLoading(true)
        try {
            const pdfBlob = await generateResumePdf({ interviewReportId: id })
            const url = window.URL.createObjectURL(new Blob([ pdfBlob ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${id}.pdf`)
            document.body.appendChild(link)
            link.click()
            // Clean up the DOM element and object URL to prevent memory leaks
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }
        catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf, deleteReport }
}
export default useInterview
