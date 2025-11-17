import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  line: {
    borderBottom: '1px solid #000',
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 11,
    marginBottom: 5,
    marginLeft: 20,
  },
  signature: {
    marginTop: 50,
    fontSize: 10,
  },
  signatureLine: {
    borderBottom: '1px solid #000',
    width: 150,
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: 'gray',
  },
})

// POST generate PDF for prescription
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get prescription
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        consultation: {
          include: {
            appointment: {
              include: {
                patient: true,
                doctor: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!prescription) {
      return NextResponse.json(
        { message: 'Prescription not found' },
        { status: 404 }
      )
    }

    // Verify access
    if (session.user?.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id },
      })
      if (!patient || prescription.consultation?.appointment?.patientId !== patient.id) {
        return NextResponse.json(
          { message: 'Unauthorized access' },
          { status: 403 }
        )
      }
    }

    // Prepare data
    const patientName = `${prescription.consultation?.appointment?.patient?.firstName || ''} ${prescription.consultation?.appointment?.patient?.lastName || ''}`
    const doctorName = prescription.consultation?.appointment?.doctor?.user?.email?.split('@')[0] || 'Médecin'
    const specialization = prescription.consultation?.appointment?.doctor?.specialization || ''
    const phone = prescription.consultation?.appointment?.patient?.phone || ''
    const dateStr = new Date(prescription.createdAt).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Create PDF document component
    const PrescriptionPDF = React.createElement(
      Document,
      {},
      React.createElement(
        Page,
        { size: 'A4', style: styles.page },
        React.createElement(Text, { style: styles.title }, 'ORDONNANCE MÉDICALE'),
        React.createElement(View, { style: styles.line }),
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Informations Patient:'),
          React.createElement(Text, { style: styles.text }, `Nom: ${patientName}`),
          phone && React.createElement(Text, { style: styles.text }, `Téléphone: ${phone}`)
        ),
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'Médecin:'),
          React.createElement(Text, { style: styles.text }, `Dr. ${doctorName}`),
          specialization && React.createElement(Text, { style: styles.text }, `Spécialité: ${specialization}`),
          React.createElement(Text, { style: styles.text }, `Date: ${dateStr}`)
        ),
        React.createElement(
          View,
          { style: styles.section },
          React.createElement(Text, { style: styles.sectionTitle }, 'MÉDICAMENTS PRESCRITS:'),
          React.createElement(Text, { style: styles.text }, prescription.medications || '')
        ),
        prescription.instructions &&
          React.createElement(
            View,
            { style: styles.section },
            React.createElement(Text, { style: styles.sectionTitle }, 'INSTRUCTIONS:'),
            React.createElement(Text, { style: styles.text }, prescription.instructions)
          ),
        React.createElement(
          View,
          { style: styles.signature },
          React.createElement(Text, null, 'Signature du médecin:'),
          React.createElement(View, { style: styles.signatureLine })
        ),
        React.createElement(Text, { style: styles.footer }, 'Document généré par MedFlow')
      )
    )

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(PrescriptionPDF)

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ordonnance-${id.slice(0, 8)}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { message: `Error generating PDF: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}
