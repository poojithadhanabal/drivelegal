export default function Dashboard() {

  const stats = [

    {
      title: 'Supported States',
      value: '4',
      icon: '📍',
      color: 'from-pink-500 to-pink-700'
    },

    {
      title: 'Total Violations',
      value: '48+',
      icon: '🚦',
      color: 'from-blue-500 to-blue-700'
    },

    {
      title: 'High Risk Offences',
      value: '18',
      icon: '⚠️',
      color: 'from-red-500 to-red-700'
    },

    {
      title: 'Most Common',
      value: 'Helmet',
      icon: '🪖',
      color: 'from-green-500 to-green-700'
    }

  ]

  const risks = [

    {
      level: 'Severe Risk',
      count: 6
    },

    {
      level: 'High Risk',
      count: 18
    },

    {
      level: 'Medium Risk',
      count: 20
    },

    {
      level: 'Low Risk',
      count: 4
    }

  ]

  return (

    <div className="mt-12 w-full max-w-6xl mx-auto">

      <h2 className="
        text-4xl
        font-bold
        text-center
        text-white
        mb-10
      ">
        📊 DriveLegal Analytics
      </h2>

      {/* TOP STATS */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-4
        gap-6
      ">

        {stats.map((item, idx) => (

          <div
            key={idx}
            className={`
              bg-gradient-to-br
              ${item.color}
              rounded-3xl
              p-6
              shadow-2xl
            `}
          >

            <div className="text-5xl mb-4">
              {item.icon}
            </div>

            <p className="text-lg text-white/80">
              {item.title}
            </p>

            <h3 className="text-4xl font-bold mt-3 text-white">
              {item.value}
            </h3>

          </div>

        ))}

      </div>

      {/* RISK DISTRIBUTION */}

      <div className="
        mt-10
        bg-[#1b2138]
        border
        border-gray-700
        rounded-3xl
        p-8
      ">

        <h3 className="
          text-3xl
          font-bold
          text-pink-400
          mb-8
        ">
          🚨 Risk Distribution
        </h3>

        <div className="space-y-6">

          {risks.map((risk, idx) => (

            <div key={idx}>

              <div className="
                flex
                justify-between
                mb-2
              ">

                <span className="text-lg">
                  {risk.level}
                </span>

                <span className="font-bold">
                  {risk.count}
                </span>

              </div>

              <div className="
                w-full
                bg-[#242c49]
                rounded-full
                h-4
              ">

                <div
                  className="
                    bg-gradient-to-r
                    from-pink-500
                    to-red-500
                    h-4
                    rounded-full
                  "
                  style={{
                    width: `${risk.count * 4}%`
                  }}
                />

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  )
}