import { useState } from 'react'

export default function Calculator() {

  const offences = [

    {
      name: 'Helmet Violation',
    },

    {
      name: 'Triple Riding',
    },

    {
      name: 'Mobile While Driving',
    },

    {
      name: 'No Insurance',
    },

    {
      name: 'Seat Belt Violation',
    },

    {
      name: 'Drunk Driving',
    },
  ]

  const [selected, setSelected] = useState([])
  const [result, setResult] = useState(null)

  const toggleOffence = async (offence) => {

    try {

      const response = await fetch(
        'http://localhost:8000/api/challan',
        {

          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({

            violation: offence.name,
            vehicle_type: 'Bike',
            state: 'Tamil Nadu',
            is_repeat: false,
          }),
        }
      )

      const data = await response.json()

      if (data.status === 'ok') {

        setSelected([...selected, data])

        setResult(data)
      }

    } catch (error) {

      console.log(error)
    }
  }

  const total = selected.reduce(
    (sum, item) => sum + item.total,
    0
  )

  return (

    <div className="
      bg-[#1b2138]
      border
      border-gray-700
      rounded-3xl
      p-8
      shadow-2xl
      mt-8
    ">

      <h2 className="
        text-3xl
        font-bold
        text-pink-400
        mb-6
      ">
        🧮 Challan Calculator
      </h2>

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-4
      ">

        {offences.map((offence, idx) => (

          <button
            key={idx}

            onClick={() => toggleOffence(offence)}

            className="
              p-4
              rounded-2xl
              border
              text-left
              transition
              bg-[#242c49]
              border-gray-700
              hover:border-pink-500
            "
          >

            <p className="text-lg font-semibold">
              {offence.name}
            </p>

          </button>

        ))}

      </div>

      <div className="
        mt-8
        bg-[#242c49]
        rounded-2xl
        p-6
      ">

        <h3 className="
          text-2xl
          font-bold
          text-green-400
        ">
          Total Fine: ₹{total}
        </h3>

        {result && (

          <div className="mt-5 space-y-2">

            <p>
              🚦 Violation:
              {' '}
              {result.violation}
            </p>

            <p>
              📘 Section:
              {' '}
              {result.law_section}
            </p>

            <p>
              💰 Base Fine:
              {' '}
              ₹{result.base_fine}
            </p>

            <p>
              🏛 Court Fee:
              {' '}
              ₹{result.court_fee}
            </p>

            <p>
              ⚠ State:
              {' '}
              {result.state}
            </p>

            <p>
              📝 Notes:
              {' '}
              {result.notes}
            </p>

          </div>
        )}

      </div>

    </div>
  )
}