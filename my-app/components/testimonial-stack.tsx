"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ChevronRight, Sparkles, ExternalLink, ChevronLeft } from "lucide-react"
import Image from "next/image"

const testimonials = [
	{
		id: 1,
		quote:
			"Extend outperformed every solution we tested -- other vendors, open source, and even foundation models. It now powers key document workflows across 30,000 customers, helping us build the most intelligent and modern financial platform out there.",
		name: "Pedro Franceschi",
		title: "CEO",
		avatar: "/placeholder.svg?height=60&width=60",
		hasStory: false,
	},
	{
		id: 2,
		quote:
			"We did a bakeoff, and Extend had the best results of any solution on the market. It eliminates an entire class of engineering problems around accuracy that we don't want to worry about.",
		name: "Matt Hodgson",
		title: "CTO",
		avatar: "/placeholder.svg?height=60&width=60",
		hasStory: true,
	},
	{
		id: 3,
		quote:
			"We were able to replicate 6 months of work in 2 weeks (!) with Extend. We're now scaling this up across all 5 million people with cancer in our network, truly transforming our work against this disease.",
		name: "George Ho",
		title: "Senior Machine Learning Scientist",
		avatar: "/placeholder.svg?height=60&width=60",
		hasStory: true,
	},
	{
		id: 4,
		quote:
			"Our goal was to speed up our manual document review, but after a month, we realized our team never made any edits. We actually removed the human from the loop entirely.",
		name: "Mike Abner",
		title: "CTO",
		avatar: "/placeholder.svg?height=60&width=60",
		hasStory: true,
	},
	{
		id: 5,
		quote:
			"Extend eliminates the ongoing maintenance cost of model tuning, scoring, evaluations, and more. We're able to focus on innovating on our core experience, instead of managing the infra.",
		name: "Adam Litton",
		title: "Staff Software Engineer",
		avatar: "/placeholder.svg?height=60&width=60",
		hasStory: false,
	},
	{
		id: 6,
		quote:
			"Extend outperformed 15 other vendors, including all major providers, on real-world docs. Their platform gives us the tooling to adapt fast, improve accuracy, and stay ahead as models evolve.",
		name: "Gavin Nachbar",
		title: "CEO",
		avatar: "/placeholder.svg?height=60&width=60",
		hasStory: false,
	},
	{
		id: 7,
		quote:
			"I don't know what you guys are doing under the hood, but it's so much more accurate than any other tool we've tried.",
		name: "Fabio Fleitas",
		title: "Co-Founder & CTO",
		avatar: "/placeholder.svg?height=60&width=60",
		hasStory: false,
	},
	{
		id: 8,
		quote:
			"Extend is the best OCR tool we've used so far. Its great UX, DX and performance have removed the need for building custom OCR models, saving us significant time and effort. Plus, the team behind is super cool to work with: they're responsive, talented and reliable.",
		name: "Nicolas Li",
		title: "Head of Engineering",
		avatar: "/placeholder.svg?height=60&width=60",
		hasStory: false,
	},
]

export default function TestimonialStack() {
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isAnimating, setIsAnimating] = useState(false)
	const [dragStart, setDragStart] = useState<number | null>(null)
	const stackRef = useRef<HTMLDivElement>(null)

	const navigateForward = () => {
		if (isAnimating) return
		setIsAnimating(true)
		setTimeout(() => {
			setCurrentIndex((prev) => (prev + 1) % testimonials.length)
			setIsAnimating(false)
		}, 300)
	}

	const navigateBackward = () => {
		if (isAnimating) return
		setIsAnimating(true)
		setTimeout(() => {
			setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
			setIsAnimating(false)
		}, 300)
	}

	const handleTouchStart = (e: React.TouchEvent) => {
		setDragStart(e.touches[0].clientX)
	}

	const handleTouchEnd = (e: React.TouchEvent) => {
		if (dragStart === null) return

		const dragEnd = e.changedTouches[0].clientX
		const dragDistance = dragStart - dragEnd
		const minSwipeDistance = 50

		if (Math.abs(dragDistance) > minSwipeDistance) {
			if (dragDistance > 0) {
				// Swiped left - go forward
				navigateForward()
			} else {
				// Swiped right - go backward
				navigateBackward()
			}
		}
		setDragStart(null)
	}

	const handleMouseDown = (e: React.MouseEvent) => {
		setDragStart(e.clientX)
	}

	const handleMouseUp = (e: React.MouseEvent) => {
		if (dragStart === null) return

		const dragEnd = e.clientX
		const dragDistance = dragStart - dragEnd
		const minSwipeDistance = 50

		if (Math.abs(dragDistance) > minSwipeDistance) {
			if (dragDistance > 0) {
				// Dragged left - go forward
				navigateForward()
			} else {
				// Dragged right - go backward
				navigateBackward()
			}
		} else if (Math.abs(dragDistance) < 10) {
			// Small movement - treat as click
			navigateForward()
		}
		setDragStart(null)
	}

	const getCardStyle = (index: number) => {
		const position = (index - currentIndex + testimonials.length) % testimonials.length

		// Different rotation angles and offsets for each position
		const rotations = [-2, 3, -1, 2, -3]
		const xOffsets = [0, -8, 12, -6, 10]
		const yOffsets = [0, 12, 24, 36, 48]

		if (position === 0) {
			return {
				transform: isAnimating ? "translateY(-120%) scale(0.9) rotate(-5deg)" : "translateY(0) scale(1) rotate(0deg)",
				zIndex: 20,
				opacity: isAnimating ? 0 : 1,
				filter: "drop-shadow(0 25px 50px rgba(139, 92, 246, 0.3))",
				transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
			}
		} else if (position <= 4) {
			const rotation = rotations[position - 1]
			const xOffset = xOffsets[position - 1]
			const yOffset = yOffsets[position - 1]
			const scale = 1 - position * 0.03
			const opacity = 1 - position * 0.15

			return {
				transform: `translateY(${yOffset}px) translateX(${xOffset}px) scale(${scale}) rotate(${rotation}deg)`,
				zIndex: 20 - position,
				opacity: opacity,
				filter: `drop-shadow(0 ${10 + position * 5}px ${20 + position * 10}px rgba(139, 92, 246, ${0.2 - position * 0.03}))`,
				transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
			}
		} else {
			return {
				transform: "translateY(60px) scale(0.88) rotate(-4deg)",
				zIndex: 1,
				opacity: 0.3,
				filter: "drop-shadow(0 15px 30px rgba(139, 92, 246, 0.1))",
				transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
			}
		}
	}

	return (
		<div className="">
			{/* Celestial Background */}
			<div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-60" />
			<div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/40" />

			<div className="relative z-10">
				{/* Header Section */}
				<div className="text-center mb-20">
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-purple-200/50 mb-6">
						<Star className="w-4 h-4 text-purple-500" />
						<p className="text-purple-700 text-sm font-medium">What our customers say...</p>
					</div>

					<h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight">
						We are trusted by{" "}
						<span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
							1,000+
						</span>{" "}
						Businesses
					</h2>

					<p className="text-gray-600 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
						Here are some of their impressions that found their protection with us.
					</p>

					{/* Floating Rating */}
					<div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-lg shadow-purple-500/10">
						<Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
						<span className="font-bold text-gray-900 text-lg">4.5/5</span>
						<span className="text-purple-400">•</span>
						<span className="text-gray-600 font-medium">10,000+ Users</span>
					</div>
				</div>

				{/* Navigation Instructions */}
				<div className="text-center mb-8">
					<p className="text-gray-500 text-sm flex items-center justify-center gap-4">
						<span className="flex items-center gap-1">
							<ChevronLeft className="w-4 h-4" />
							Swipe right to go back
						</span>
						<span>•</span>
						<span>Click to advance</span>
						<span>•</span>
						<span className="flex items-center gap-1">
							Swipe left to go forward
							<ChevronRight className="w-4 h-4" />
						</span>
					</p>
				</div>

				{/* Testimonial Cards Stack */}
				<div
					ref={stackRef}
					className="relative h-[450px] mb-16 cursor-pointer select-none"
					onTouchStart={handleTouchStart}
					onTouchEnd={handleTouchEnd}
					onMouseDown={handleMouseDown}
					onMouseUp={handleMouseUp}
					onDragStart={(e) => e.preventDefault()}
				>
					{testimonials.map((testimonial, index) => (
						<Card
							key={testimonial.id}
							className="absolute inset-0 w-full max-w-3xl mx-auto border-0 overflow-hidden"
							style={getCardStyle(index)}
						>
							<div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-purple-50/80 backdrop-blur-xl" />
							<div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-purple-100/30" />

							<CardContent className="relative p-6 md:p-8 pointer-events-none">
								<blockquote className="text-lg md:text-xl text-gray-800 leading-relaxed mb-6 font-light">
									<span className="text-3xl text-purple-300/40 font-serif">&quot;</span>
									{testimonial.quote}
									<span className="text-3xl text-purple-300/40 font-serif">&quot;</span>
								</blockquote>

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="relative">
											<div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-200 to-pink-200 flex-shrink-0 ring-2 ring-white/50">
												<Image
													src={testimonial.avatar || "/placeholder.svg"}
													alt={testimonial.name}
													className="w-full h-full object-cover"
													width={60}
													height={60}
												/>
											</div>
											<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white" />
										</div>
										<div>
											<h4 className="font-bold text-gray-900 text-lg mb-1">{testimonial.name}</h4>
											<p className="text-purple-600 font-medium text-sm">{testimonial.title}</p>
										</div>
									</div>

									{testimonial.hasStory && (
										<Button
											variant="outline"
											size="sm"
											className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 pointer-events-auto"
											onClick={(e) => e.stopPropagation()}
										>
											Read the story
											<ExternalLink className="w-3 h-3 ml-2" />
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Navigation Controls */}
				<div className="flex justify-center items-center gap-6 mb-12">
					<Button
						variant="outline"
						size="sm"
						onClick={navigateBackward}
						disabled={isAnimating}
						className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50"
					>
						<ChevronLeft className="w-4 h-4 mr-1" />
						Previous
					</Button>

					{/* Pagination Dots */}
					<div className="flex gap-3">
						{testimonials.map((_, index) => (
							<button
								key={index}
								className={`transition-all duration-500 rounded-full ${
									index === currentIndex
										? "w-12 h-3 bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30"
										: "w-3 h-3 bg-white/60 hover:bg-purple-200/80 backdrop-blur-sm border border-purple-200/50"
								}`}
								onClick={() => {
									if (!isAnimating) {
										setIsAnimating(true)
										setTimeout(() => {
											setCurrentIndex(index)
											setIsAnimating(false)
										}, 300)
									}
								}}
								disabled={isAnimating}
							/>
						))}
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={navigateForward}
						disabled={isAnimating}
						className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50"
					>
						Next
						<ChevronRight className="w-4 h-4 ml-1" />
					</Button>
				</div>

				
			</div>
		</div>
	)
}
