import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')

  // Clear existing data
  await prisma.auditLog.deleteMany()
  await prisma.fuelRecord.deleteMany()
  await prisma.car.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  const hashedPassword = await bcrypt.hash('password123', 10)

  // User 1 — Alice, Toyota Camry, 12 records
  const user1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: hashedPassword,
      cars: {
        create: [
          {
            name: 'Alice Daily',
            brand: 'Toyota',
            model: 'Camry',
            fuelRecords: {
              create: [
                {
                  date: new Date('2024-01-01'),
                  odometer: 200000,
                  fuelCost: 2000,
                  pricePerLitre: 40,
                  litresRefueled: 50,
                  distanceTraveled: 0,
                  consumptionRate: null,
                  isFullTank: true
                },
                {
                  date: new Date('2024-01-10'),
                  odometer: 200500,
                  fuelCost: 2050,
                  pricePerLitre: 41,
                  litresRefueled: 50,
                  distanceTraveled: 500,
                  consumptionRate: 500 / 50,
                  isFullTank: true
                },
                {
                  date: new Date('2024-01-20'),
                  odometer: 200980,
                  fuelCost: 1920,
                  pricePerLitre: 40,
                  litresRefueled: 48,
                  distanceTraveled: 480,
                  consumptionRate: 480 / 48,
                  isFullTank: true
                },
                {
                  date: new Date('2024-01-28'),
                  odometer: 201400,
                  fuelCost: 1700,
                  pricePerLitre: 39.5,
                  litresRefueled: 1700 / 39.5,
                  distanceTraveled: 420,
                  consumptionRate: 420 / (1700 / 39.5),
                  isFullTank: true
                },
                {
                  date: new Date('2024-02-05'),
                  odometer: 201900,
                  fuelCost: 2000,
                  pricePerLitre: 40,
                  litresRefueled: 50,
                  distanceTraveled: 500,
                  consumptionRate: 500 / 50,
                  isFullTank: true
                },
                {
                  date: new Date('2024-02-14'),
                  odometer: 202350,
                  fuelCost: 1845,
                  pricePerLitre: 41,
                  litresRefueled: 45,
                  distanceTraveled: 450,
                  consumptionRate: 450 / 45,
                  isFullTank: true
                },
                {
                  date: new Date('2024-02-22'),
                  odometer: 202800,
                  fuelCost: 1800,
                  pricePerLitre: 40,
                  litresRefueled: 45,
                  distanceTraveled: 450,
                  consumptionRate: 450 / 45,
                  isFullTank: true
                },
                {
                  date: new Date('2024-03-02'),
                  odometer: 203250,
                  fuelCost: 1560,
                  pricePerLitre: 39,
                  litresRefueled: 40,
                  distanceTraveled: 450,
                  consumptionRate: 450 / 40,
                  isFullTank: true
                },
                {
                  date: new Date('2024-03-11'),
                  odometer: 203700,
                  fuelCost: 1800,
                  pricePerLitre: 40,
                  litresRefueled: 45,
                  distanceTraveled: 450,
                  consumptionRate: 450 / 45,
                  isFullTank: true
                },
                {
                  date: new Date('2024-03-20'),
                  odometer: 204100,
                  fuelCost: 1640,
                  pricePerLitre: 41,
                  litresRefueled: 40,
                  distanceTraveled: 400,
                  consumptionRate: 400 / 40,
                  isFullTank: true
                },
                {
                  date: new Date('2024-03-29'),
                  odometer: 204550,
                  fuelCost: 1800,
                  pricePerLitre: 40,
                  litresRefueled: 45,
                  distanceTraveled: 450,
                  consumptionRate: 450 / 45,
                  isFullTank: true
                },
                {
                  date: new Date('2024-04-06'),
                  odometer: 205000,
                  fuelCost: 1755,
                  pricePerLitre: 39,
                  litresRefueled: 45,
                  distanceTraveled: 450,
                  consumptionRate: 450 / 45,
                  isFullTank: true
                }
              ]
            }
          }
        ]
      }
    }
  })

  // User 2 — Bob, Honda Civic, 13 records
  const user2 = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: hashedPassword,
      cars: {
        create: [
          {
            name: 'Bob Work Car',
            brand: 'Honda',
            model: 'Civic',
            fuelRecords: {
              create: [
                {
                  date: new Date('2024-02-01'),
                  odometer: 50000,
                  fuelCost: 1600,
                  pricePerLitre: 40,
                  litresRefueled: 40,
                  distanceTraveled: 0,
                  consumptionRate: null,
                  isFullTank: true
                },
                {
                  date: new Date('2024-02-10'),
                  odometer: 50600,
                  fuelCost: 1845,
                  pricePerLitre: 41,
                  litresRefueled: 45,
                  distanceTraveled: 600,
                  consumptionRate: 600 / 45,
                  isFullTank: true
                },
                {
                  date: new Date('2024-02-20'),
                  odometer: 51150,
                  fuelCost: 1600,
                  pricePerLitre: 40,
                  litresRefueled: 40,
                  distanceTraveled: 550,
                  consumptionRate: 550 / 40,
                  isFullTank: true
                },
                {
                  date: new Date('2024-03-01'),
                  odometer: 51650,
                  fuelCost: 1560,
                  pricePerLitre: 39,
                  litresRefueled: 40,
                  distanceTraveled: 500,
                  consumptionRate: 500 / 40,
                  isFullTank: true
                },
                {
                  date: new Date('2024-03-10'),
                  odometer: 52250,
                  fuelCost: 1800,
                  pricePerLitre: 40,
                  litresRefueled: 45,
                  distanceTraveled: 600,
                  consumptionRate: 600 / 45,
                  isFullTank: true
                },
                {
                  date: new Date('2024-03-18'),
                  odometer: 52700,
                  fuelCost: 1640,
                  pricePerLitre: 41,
                  litresRefueled: 40,
                  distanceTraveled: 450,
                  consumptionRate: 450 / 40,
                  isFullTank: true
                },
                {
                  date: new Date('2024-03-26'),
                  odometer: 53200,
                  fuelCost: 1600,
                  pricePerLitre: 40,
                  litresRefueled: 40,
                  distanceTraveled: 500,
                  consumptionRate: 500 / 40,
                  isFullTank: true
                },
                {
                  date: new Date('2024-04-03'),
                  odometer: 53750,
                  fuelCost: 1755,
                  pricePerLitre: 39,
                  litresRefueled: 45,
                  distanceTraveled: 550,
                  consumptionRate: 550 / 45,
                  isFullTank: true
                },
                {
                  date: new Date('2024-04-12'),
                  odometer: 54300,
                  fuelCost: 1800,
                  pricePerLitre: 40,
                  litresRefueled: 45,
                  distanceTraveled: 550,
                  consumptionRate: 550 / 45,
                  isFullTank: true
                },
                {
                  date: new Date('2024-04-20'),
                  odometer: 54750,
                  fuelCost: 1640,
                  pricePerLitre: 41,
                  litresRefueled: 40,
                  distanceTraveled: 450,
                  consumptionRate: 450 / 40,
                  isFullTank: true
                },
                {
                  date: new Date('2024-04-28'),
                  odometer: 55200,
                  fuelCost: 1560,
                  pricePerLitre: 39,
                  litresRefueled: 40,
                  distanceTraveled: 450,
                  consumptionRate: 450 / 40,
                  isFullTank: true
                },
                {
                  date: new Date('2024-05-06'),
                  odometer: 55800,
                  fuelCost: 2000,
                  pricePerLitre: 40,
                  litresRefueled: 50,
                  distanceTraveled: 600,
                  consumptionRate: 600 / 50,
                  isFullTank: true
                },
                {
                  date: new Date('2024-05-15'),
                  odometer: 56350,
                  fuelCost: 1845,
                  pricePerLitre: 41,
                  litresRefueled: 45,
                  distanceTraveled: 550,
                  consumptionRate: 550 / 45,
                  isFullTank: true
                }
              ]
            }
          }
        ]
      }
    }
  })

  // User 3 — Charlie, Ford Ranger, 15 records
  const user3 = await prisma.user.create({
    data: {
      name: 'Charlie Davis',
      email: 'charlie@example.com',
      password: hashedPassword,
      cars: {
        create: [
          {
            name: 'Charlie Truck',
            brand: 'Ford',
            model: 'Ranger',
            fuelRecords: {
              create: [
                {
                  date: new Date('2024-01-05'),
                  odometer: 100000,
                  fuelCost: 2800,
                  pricePerLitre: 40,
                  litresRefueled: 70,
                  distanceTraveled: 0,
                  consumptionRate: null,
                  isFullTank: true
                },
                {
                  date: new Date('2024-01-15'),
                  odometer: 100800,
                  fuelCost: 3120,
                  pricePerLitre: 39,
                  litresRefueled: 80,
                  distanceTraveled: 800,
                  consumptionRate: 800 / 80,
                  isFullTank: true
                },
                {
                  date: new Date('2024-01-25'),
                  odometer: 101550,
                  fuelCost: 3000,
                  pricePerLitre: 40,
                  litresRefueled: 75,
                  distanceTraveled: 750,
                  consumptionRate: 750 / 75,
                  isFullTank: true
                },
                {
                  date: new Date('2024-02-03'),
                  odometer: 102300,
                  fuelCost: 2925,
                  pricePerLitre: 39,
                  litresRefueled: 75,
                  distanceTraveled: 750,
                  consumptionRate: 750 / 75,
                  isFullTank: true
                },
                {
                  date: new Date('2024-02-12'),
                  odometer: 103100,
                  fuelCost: 3200,
                  pricePerLitre: 40,
                  litresRefueled: 80,
                  distanceTraveled: 800,
                  consumptionRate: 800 / 80,
                  isFullTank: true
                },
                {
                  date: new Date('2024-02-22'),
                  odometer: 103850,
                  fuelCost: 3075,
                  pricePerLitre: 41,
                  litresRefueled: 75,
                  distanceTraveled: 750,
                  consumptionRate: 750 / 75,
                  isFullTank: true
                },
                {
                  date: new Date('2024-03-02'),
                  odometer: 104500,
                  fuelCost: 2600,
                  pricePerLitre: 40,
                  litresRefueled: 65,
                  distanceTraveled: 650,
                  consumptionRate: 650 / 65,
                  isFullTank: true
                },
                {
                  date: new Date('2024-03-11'),
                  odometer: 105300,
                  fuelCost: 3200,
                  pricePerLitre: 40,
                  litresRefueled: 80,
                  distanceTraveled: 800,
                  consumptionRate: 800 / 80,
                  isFullTank: true
                },
                {
                  date: new Date('2024-03-20'),
                  odometer: 106000,
                  fuelCost: 2730,
                  pricePerLitre: 39,
                  litresRefueled: 70,
                  distanceTraveled: 700,
                  consumptionRate: 700 / 70,
                  isFullTank: true
                },
                {
                  date: new Date('2024-03-30'),
                  odometer: 106700,
                  fuelCost: 2800,
                  pricePerLitre: 40,
                  litresRefueled: 70,
                  distanceTraveled: 700,
                  consumptionRate: 700 / 70,
                  isFullTank: true
                },
                {
                  date: new Date('2024-04-08'),
                  odometer: 107500,
                  fuelCost: 3200,
                  pricePerLitre: 40,
                  litresRefueled: 80,
                  distanceTraveled: 800,
                  consumptionRate: 800 / 80,
                  isFullTank: true
                },
                {
                  date: new Date('2024-04-17'),
                  odometer: 108200,
                  fuelCost: 2870,
                  pricePerLitre: 41,
                  litresRefueled: 70,
                  distanceTraveled: 700,
                  consumptionRate: 700 / 70,
                  isFullTank: true
                },
                {
                  date: new Date('2024-04-26'),
                  odometer: 108950,
                  fuelCost: 3000,
                  pricePerLitre: 40,
                  litresRefueled: 75,
                  distanceTraveled: 750,
                  consumptionRate: 750 / 75,
                  isFullTank: true
                },
                {
                  date: new Date('2024-05-05'),
                  odometer: 109600,
                  fuelCost: 2535,
                  pricePerLitre: 39,
                  litresRefueled: 65,
                  distanceTraveled: 650,
                  consumptionRate: 650 / 65,
                  isFullTank: true
                },
                {
                  date: new Date('2024-05-14'),
                  odometer: 110400,
                  fuelCost: 3200,
                  pricePerLitre: 40,
                  litresRefueled: 80,
                  distanceTraveled: 800,
                  consumptionRate: 800 / 80,
                  isFullTank: true
                }
              ]
            }
          }
        ]
      }
    }
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
