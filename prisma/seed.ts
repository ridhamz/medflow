// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seed...')

  // Vérifier si des données existent déjà
  const existingUsers = await prisma.user.count()
  if (existingUsers > 0) {
    console.log('⚠️  Des données existent déjà. Nettoyage...')
    
    // Supprimer toutes les données dans l'ordre (à cause des relations)
    await prisma.prescription.deleteMany()
    await prisma.consultation.deleteMany()
    await prisma.appointment.deleteMany()
    await prisma.invoice.deleteMany()
    await prisma.service.deleteMany()
    await prisma.doctor.deleteMany()
    await prisma.patient.deleteMany()
    await prisma.user.deleteMany()
    await prisma.clinic.deleteMany()
    
    console.log('✅ Données nettoyées')
  }

  // Créer une clinique
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Clinique Méditerranée',
      address: 'Avenue Habib Bourguiba, Tunis, Tunisie',
      phone: '+216 71 123 456',
    },
  })
  console.log('✅ Clinique créée')

  // Créer un admin
  const adminPassword = await hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@medflow.tn',
      password: adminPassword,
      role: 'ADMIN',
      clinicId: clinic.id,
    },
  })
  console.log('✅ Admin créé - Email: admin@medflow.tn / Pass: admin123')

  // Créer un médecin
  const doctorPassword = await hash('doctor123', 10)
  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor@medflow.tn',
      password: doctorPassword,
      role: 'DOCTOR',
      clinicId: clinic.id,
    },
  })

  const doctor = await prisma.doctor.create({
    data: {
      userId: doctorUser.id,
      specialization: 'Cardiologie',
    },
  })
  console.log('✅ Médecin créé - Email: doctor@medflow.tn / Pass: doctor123')

  // Créer une réceptionniste
  const receptionistPassword = await hash('receptionist123', 10)
  const receptionist = await prisma.user.create({
    data: {
      email: 'receptionist@medflow.tn',
      password: receptionistPassword,
      role: 'RECEPTIONIST',
      clinicId: clinic.id,
    },
  })
  console.log('✅ Réceptionniste créée - Email: receptionist@medflow.tn / Pass: receptionist123')

  // Créer un patient
  const patientPassword = await hash('patient123', 10)
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@medflow.tn',
      password: patientPassword,
      role: 'PATIENT',
    },
  })

  const patient = await prisma.patient.create({
    data: {
      userId: patientUser.id,
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      dateOfBirth: new Date('1990-05-15'),
      phone: '+216 98 765 432',
    },
  })
  console.log('✅ Patient créé - Email: patient@medflow.tn / Pass: patient123')

  // Créer des services
  await prisma.service.createMany({
    data: [
      {
        clinicId: clinic.id,
        name: 'Consultation Générale',
        description: 'Consultation médicale générale',
        price: 50,
      },
      {
        clinicId: clinic.id,
        name: 'Consultation Spécialisée',
        description: 'Consultation avec un spécialiste',
        price: 80,
      },
      {
        clinicId: clinic.id,
        name: 'Analyses Médicales',
        description: 'Prélèvement et analyses',
        price: 120,
      },
    ],
  })
  console.log('✅ Services créés')

  // Créer un rendez-vous
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      clinicId: clinic.id,
      scheduledAt: tomorrow,
      status: 'SCHEDULED',
      notes: 'Première consultation',
    },
  })
  console.log('✅ Rendez-vous créé')

  console.log('\n🎉 Seed terminé avec succès!')
  console.log('\n📋 Comptes créés:')
  console.log('-----------------------------------')
  console.log('Admin        : admin@medflow.tn / admin123')
  console.log('Médecin      : doctor@medflow.tn / doctor123')
  console.log('Réceptionniste: receptionist@medflow.tn / receptionist123')
  console.log('Patient      : patient@medflow.tn / patient123')
  console.log('-----------------------------------\n')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })