import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  console.log('🗑️  Cleaning existing data...');
  await prisma.appointment.deleteMany();
  await prisma.workSchedule.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.therapy.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Data cleaned\n');

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  console.log('👥 Creating users...');

  const admin = await prisma.user.create({
    data: {
      nationalId: 'admin',
      username: 'admin',
      password: adminPasswordHash,
      fullName: 'System Administrator',
      email: 'admin@flova.com',
      phone: '0999999999',
      insuranceType: 'none',
      role: 'admin'
    }
  });
  console.log('  ✓ Admin created');

  const patient1 = await prisma.user.create({
    data: {
      nationalId: '1234567890',
      username: '1234567890',
      password: passwordHash,
      fullName: 'Juan Perez Garcia',
      email: 'juan.perez@email.com',
      phone: '0987654321',
      insuranceType: 'iess',
      role: 'paciente'
    }
  });

  const patient2 = await prisma.user.create({
    data: {
      nationalId: '0987654321',
      username: '0987654321',
      password: passwordHash,
      fullName: 'Maria Gonzalez Lopez',
      email: 'maria.gonzalez@email.com',
      phone: '0987654322',
      insuranceType: 'privado',
      role: 'paciente'
    }
  });

  const patient3 = await prisma.user.create({
    data: {
      nationalId: '1122334455',
      username: '1122334455',
      password: passwordHash,
      fullName: 'Carlos Ramirez Torres',
      email: 'carlos.ramirez@email.com',
      phone: '0987654323',
      insuranceType: 'issfa',
      role: 'paciente'
    }
  });

  console.log('  ✓ 3 patients created');

  const doctorUser1 = await prisma.user.create({
    data: {
      nationalId: '1111111111',
      username: '1111111111',
      password: passwordHash,
      fullName: 'Dr. Carlos Mendoza Silva',
      email: 'carlos.mendoza@flova.com',
      phone: '0991111111',
      insuranceType: 'privado',
      role: 'medico'
    }
  });

  const doctorUser2 = await prisma.user.create({
    data: {
      nationalId: '2222222222',
      username: '2222222222',
      password: passwordHash,
      fullName: 'Dra. Maria Gonzalez Ruiz',
      email: 'maria.gonzalez.med@flova.com',
      phone: '0992222222',
      insuranceType: 'privado',
      role: 'medico'
    }
  });

  const doctorUser3 = await prisma.user.create({
    data: {
      nationalId: '3333333333',
      username: '3333333333',
      password: passwordHash,
      fullName: 'Dr. Roberto Silva Morales',
      email: 'roberto.silva@flova.com',
      phone: '0993333333',
      insuranceType: 'privado',
      role: 'medico'
    }
  });

  const doctorUser4 = await prisma.user.create({
    data: {
      nationalId: '4444444444',
      username: '4444444444',
      password: passwordHash,
      fullName: 'Dra. Ana Martinez Vega',
      email: 'ana.martinez@flova.com',
      phone: '0994444444',
      insuranceType: 'privado',
      role: 'medico'
    }
  });

  console.log('  ✓ 4 doctors created\n');

  console.log('🩺 Creating doctor profiles...');

  const doctor1 = await prisma.doctor.create({
    data: {
      userId: doctorUser1.id,
      specialty: 'Fisioterapia',
      licenseNumber: 'MED-FIS-001',
      rating: 4.8,
      patientsServed: 245
    }
  });

  const doctor2 = await prisma.doctor.create({
    data: {
      userId: doctorUser2.id,
      specialty: 'Terapia Ocupacional',
      licenseNumber: 'MED-TO-002',
      rating: 4.9,
      patientsServed: 189
    }
  });

  const doctor3 = await prisma.doctor.create({
    data: {
      userId: doctorUser3.id,
      specialty: 'Psicologia',
      licenseNumber: 'MED-PSI-003',
      rating: 4.7,
      patientsServed: 312
    }
  });

  const doctor4 = await prisma.doctor.create({
    data: {
      userId: doctorUser4.id,
      specialty: 'Fisioterapia',
      licenseNumber: 'MED-FIS-004',
      rating: 4.6,
      patientsServed: 156
    }
  });

  console.log('  ✓ 4 doctor profiles created\n');

  console.log('📅 Creating work schedules...');

  for (let day = 1; day <= 5; day++) {
    await prisma.workSchedule.create({
      data: {
        doctorId: doctor1.id,
        dayOfWeek: day,
        startTime: '08:00',
        endTime: '16:00'
      }
    });
  }
  await prisma.workSchedule.create({
    data: {
      doctorId: doctor1.id,
      dayOfWeek: 6,
      startTime: '08:00',
      endTime: '12:00'
    }
  });

  for (let day = 1; day <= 5; day++) {
    await prisma.workSchedule.create({
      data: {
        doctorId: doctor2.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00'
      }
    });
  }

  for (let day = 1; day <= 5; day++) {
    await prisma.workSchedule.create({
      data: {
        doctorId: doctor3.id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '18:00'
      }
    });
  }
  await prisma.workSchedule.create({
    data: {
      doctorId: doctor3.id,
      dayOfWeek: 6,
      startTime: '10:00',
      endTime: '14:00'
    }
  });

  for (let day = 1; day <= 5; day++) {
    await prisma.workSchedule.create({
      data: {
        doctorId: doctor4.id,
        dayOfWeek: day,
        startTime: '14:00',
        endTime: '20:00'
      }
    });
  }

  console.log('  ✓ Work schedules created\n');

  console.log('💊 Creating therapies...');

  const therapy1 = await prisma.therapy.create({
    data: {
      name: 'Fisioterapia Deportiva',
      description: 'Specialized treatment for sports injuries and athlete recovery. Includes advanced rehabilitation techniques.',
      specialty: 'Fisioterapia',
      duration: 60,
      price: 45.00,
      image: 'https://picsum.photos/seed/fisio1/400/300',
      active: true
    }
  });

  const therapy2 = await prisma.therapy.create({
    data: {
      name: 'Rehabilitacion Post-Quirurgica',
      description: 'Comprehensive rehabilitation program after orthopedic surgeries. Full functional recovery.',
      specialty: 'Fisioterapia',
      duration: 75,
      price: 65.00,
      image: 'https://picsum.photos/seed/fisio2/400/300',
      active: true
    }
  });

  const therapy3 = await prisma.therapy.create({
    data: {
      name: 'Terapia Ocupacional Pediatrica',
      description: 'Early intervention for children with difficulties in motor and cognitive development.',
      specialty: 'Terapia Ocupacional',
      duration: 45,
      price: 50.00,
      image: 'https://picsum.photos/seed/to1/400/300',
      active: true
    }
  });

  const therapy4 = await prisma.therapy.create({
    data: {
      name: 'Terapia Ocupacional para Adultos Mayores',
      description: 'Improvement of functional independence and quality of life in older adults.',
      specialty: 'Terapia Ocupacional',
      duration: 60,
      price: 55.00,
      image: 'https://picsum.photos/seed/to2/400/300',
      active: true
    }
  });

  const therapy5 = await prisma.therapy.create({
    data: {
      name: 'Terapia Cognitivo-Conductual',
      description: 'Psychological treatment for anxiety, depression and other emotional disorders.',
      specialty: 'Psicologia',
      duration: 60,
      price: 55.00,
      image: 'https://picsum.photos/seed/psi1/400/300',
      active: true
    }
  });

  const therapy6 = await prisma.therapy.create({
    data: {
      name: 'Terapia Familiar',
      description: 'Psychological intervention to improve communication and resolve family conflicts.',
      specialty: 'Psicologia',
      duration: 90,
      price: 75.00,
      image: 'https://picsum.photos/seed/psi2/400/300',
      active: true
    }
  });

  console.log('  ✓ 6 therapies created\n');

  console.log('📋 Creating sample appointments...');

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 3);

  await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      doctorId: doctor1.id,
      therapyId: therapy1.id,
      date: futureDate,
      time: '10:00',
      status: 'pending',
      symptoms: 'Right knee pain after running. Need evaluation to continue training.',
      hasExams: false,
      exams: []
    }
  });

  const futureDate2 = new Date();
  futureDate2.setDate(futureDate2.getDate() + 5);

  await prisma.appointment.create({
    data: {
      patientId: patient2.id,
      doctorId: doctor2.id,
      therapyId: therapy3.id,
      date: futureDate2,
      time: '11:00',
      status: 'confirmed',
      symptoms: 'My 5-year-old child has difficulties with fine motor skills. Needs evaluation.',
      hasExams: true,
      exams: ['evaluacion_escolar.pdf']
    }
  });

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 7);

  await prisma.appointment.create({
    data: {
      patientId: patient3.id,
      doctorId: doctor3.id,
      therapyId: therapy5.id,
      date: pastDate,
      time: '15:00',
      status: 'completed',
      symptoms: 'Generalized anxiety and sleeping problems. Seeking professional help.',
      hasExams: false,
      exams: [],
      doctorNotes: 'Patient shows symptoms of moderate anxiety. Weekly sessions recommended.'
    }
  });

  console.log('  ✓ 3 sample appointments created\n');

  console.log('✅ Seed completed successfully!\n');
  console.log('📊 SUMMARY:');
  console.log('  • 1 Administrator');
  console.log('  • 3 Patients');
  console.log('  • 4 Doctors');
  console.log('  • 6 Therapies');
  console.log('  • 3 Sample Appointments');
  console.log('');
  console.log('🔑 TEST CREDENTIALS:');
  console.log('');
  console.log('  👨‍💼 ADMIN:');
  console.log('     National ID: admin');
  console.log('     Password: admin123');
  console.log('');
  console.log('  👤 PATIENT:');
  console.log('     National ID: 1234567890');
  console.log('     Password: password123');
  console.log('');
  console.log('  👨‍⚕️ DOCTOR (Physiotherapy):');
  console.log('     National ID: 1111111111');
  console.log('     Password: password123');
  console.log('');
  console.log('  👩‍⚕️ DOCTOR (Occupational Therapy):');
  console.log('     National ID: 2222222222');
  console.log('     Password: password123');
  console.log('');
  console.log('  👨‍⚕️ DOCTOR (Psychology):');
  console.log('     National ID: 3333333333');
  console.log('     Password: password123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error in seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
