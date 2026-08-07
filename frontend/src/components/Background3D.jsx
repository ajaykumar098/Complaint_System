import { useEffect, useRef } from 'react'

export default function Background3D() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Particle system
    const particles = []
    const particleCount = 80
    const connectionDistance = 150
    const mouse = { x: null, y: null, radius: 200 }

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.size = Math.random() * 2 + 1
        this.color = this.getRandomColor()
      }

      getRandomColor() {
        const colors = [
          'rgba(0, 212, 255, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(192, 132, 252, 0.8)',
          'rgba(34, 211, 238, 0.8)',
        ]
        return colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x
          const dy = mouse.y - this.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius
            this.vx -= (dx / distance) * force * 0.5
            this.vy -= (dy / distance) * force * 0.5
          }
        }
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Floating gradient orbs
    const orbs = [
      { x: 0, y: 0, radius: 300, color: 'rgba(0, 212, 255, 0.15)', vx: 0.3, vy: 0.2 },
      { x: 0, y: 0, radius: 250, color: 'rgba(168, 85, 247, 0.12)', vx: -0.2, vy: 0.3 },
      { x: 0, y: 0, radius: 200, color: 'rgba(192, 132, 252, 0.1)', vx: 0.25, vy: -0.25 },
    ]

    // Initialize orb positions
    orbs.forEach((orb) => {
      orb.x = Math.random() * canvas.width
      orb.y = Math.random() * canvas.height
    })

    // Mouse event listeners
    const handleMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = null
      mouse.y = null
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      )
      gradient.addColorStop(0, '#0f0f23')
      gradient.addColorStop(1, '#0a0a1a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw orbs
      orbs.forEach((orb) => {
        orb.x += orb.vx
        orb.y += orb.vy

        if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius
        if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius
        if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius
        if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius

        const orbGradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius)
        orbGradient.addColorStop(0, orb.color)
        orbGradient.addColorStop(1, 'transparent')
        ctx.fillStyle = orbGradient
        ctx.fillRect(orb.x - orb.radius, orb.y - orb.radius, orb.radius * 2, orb.radius * 2)
      })

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.3
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: '#0a0a1a' }}
    />
  )
}
