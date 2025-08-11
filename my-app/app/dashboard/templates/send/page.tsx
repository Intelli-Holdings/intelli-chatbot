"use client"

import { useState, useEffect } from "react"
import { Check, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardHeader from "@/components/dashboard-header"
import AppServiceCredentials from "@/components/app-service-credentials"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAppServices } from "@/hooks/use-app-services"
import { useWhatsAppTemplates } from "@/hooks/use-whatsapp-templates"
import { WhatsAppService } from "@/services/whatsapp"

export default function SendMessagePage() {
	const {
		appServices,
		loading: appServicesLoading,
		error: appServicesError,
		refetch,
		selectedAppService,
		setSelectedAppService,
	} = useAppServices();

	const {
		templates,
		loading: templatesLoading,
		error: templatesError,
	} = useWhatsAppTemplates(selectedAppService);

	const [selectedTemplateId, setSelectedTemplateId] = useState("")
	const [phoneNumber, setPhoneNumber] = useState("")
	const [parameters, setParameters] = useState<Record<string, string>>({})
	const [isSending, setIsSending] = useState(false)
	const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null)

	const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)

	// Reset template selection when app service changes
	useEffect(() => {
		setSelectedTemplateId("")
		setParameters({})
	}, [selectedAppService?.id])

	const handleTemplateChange = (templateId: string) => {
		setSelectedTemplateId(templateId)

		// Reset parameters when template changes
		const template = templates.find((t) => t.id === templateId)
		if (template) {
			const initialParams: Record<string, string> = {}
			// Extract parameters from template components
			template.components?.forEach((component: any) => {
				if (component.parameters) {
					component.parameters.forEach((param: any, index: number) => {
						initialParams[`param_${index}`] = ""
					})
				}
			})
			setParameters(initialParams)
		} else {
			setParameters({})
		}
	}

	const handleParameterChange = (paramName: string, value: string) => {
		setParameters((prev) => ({
			...prev,
			[paramName]: value,
		}))
	}

	const buildMessagePayload = () => {
		if (!selectedTemplate) return null

		const basePayload = {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: phoneNumber,
			type: "template",
			template: {
				name: selectedTemplate.name,
				language: {
					code: selectedTemplate.language,
				},
				components: [] as any[],
			},
		}

		// Build components based on template structure
		selectedTemplate.components?.forEach((component: any) => {
			if (component.type === "HEADER" && component.format === "IMAGE") {
				basePayload.template.components.push({
					type: "header",
					parameters: [
						{
							type: "image",
							image: {
								link: component.example?.header_handle?.[0] || "",
							},
						},
					],
				})
			} else if (component.type === "BODY" && component.text) {
				// Extract parameter placeholders from body text
				const paramMatches = component.text.match(/\{\{(\d+)\}\}/g) || []
				if (paramMatches.length > 0) {
					basePayload.template.components.push({
						type: "body",
						parameters: paramMatches.map((match: string, index: number) => ({
							type: "text",
							text: parameters[`param_${index}`] || `Parameter ${index + 1}`,
						})),
					})
				}
			} else if (component.type === "BUTTONS" && component.buttons) {
				// Handle button components
				component.buttons.forEach((button: any, buttonIndex: number) => {
					if (button.type === "URL" && button.url?.includes("{{")) {
						basePayload.template.components.push({
							type: "button",
							sub_type: "url",
							index: buttonIndex.toString(),
							parameters: [
								{
									type: "text",
									text: parameters[`param_0`] || "default_value",
								},
							],
						})
					}
				})
			}
		})

		return basePayload
	}

	const handleSendTest = async () => {
		if (!selectedTemplate || !phoneNumber || !selectedAppService) return

		setIsSending(true)
		setSendResult(null)

		try {
			const payload = buildMessagePayload()
			if (!payload) {
				throw new Error("Failed to build message payload")
			}

			console.log("Sending message payload:", JSON.stringify(payload, null, 2))

			const result = await WhatsAppService.sendMessage(
				selectedAppService,
				payload
			)
			
			setSendResult({
				success: true,
				message: `Message sent successfully! Message ID: ${result.messages?.[0]?.id || "N/A"}`,
			})
		} catch (error) {
			console.error("Error sending test message:", error)
			setSendResult({
				success: false,
				message: error instanceof Error ? error.message : "Failed to send test message. Please try again.",
			})
		} finally {
			setIsSending(false)
		}
	}

	const isFormValid = selectedTemplate && phoneNumber && selectedAppService

	const getTemplateParameters = () => {
		if (!selectedTemplate) return []
		
		const params: Array<{name: string, type: string, placeholder: string}> = []
		
		selectedTemplate.components?.forEach((component: any) => {
			if (component.type === "BODY" && component.text) {
				const paramMatches = component.text.match(/\{\{(\d+)\}\}/g) || []
				paramMatches.forEach((match: string, index: number) => {
					params.push({
						name: `param_${index}`,
						type: "text",
						placeholder: `Parameter ${index + 1}`
					})
				})
			}
		})
		
		return params
	}

	return (
		<div className="flex min-h-screen flex-col">
			<DashboardHeader />
			<main className="flex-1 container py-6">
				<h1 className="text-2xl font-bold mb-6">Send Test Message</h1>

				<div className="grid md:grid-cols-[1fr_350px] gap-6">
					<div className="space-y-6">
						{/* App Service Configuration */}
						<AppServiceCredentials
							appServices={appServices}
							selectedAppService={selectedAppService}
							onSelectAppService={setSelectedAppService}
							loading={appServicesLoading}
							error={appServicesError}
							onRefresh={refetch}
						/>

						<Card>
							<CardHeader>
								<CardTitle>Select Template</CardTitle>
								<CardDescription>Choose a template to send as a test message</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="template">Template</Label>
									<Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
										<SelectTrigger id="template">
											<SelectValue placeholder="Select a template" />
										</SelectTrigger>
										<SelectContent>
											{templates.map((template) => (
												<SelectItem key={template.id} value={template.id}>
													{template.name} ({template.category})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{templatesLoading && (
										<p className="text-sm text-muted-foreground">Loading templates...</p>
									)}
									{templatesError && (
										<p className="text-sm text-red-600">Error: {templatesError}</p>
									)}
								</div>
							</CardContent>
						</Card>

						{selectedTemplate && (
							<>
								<Card>
									<CardHeader>
										<CardTitle>Recipient</CardTitle>
										<CardDescription>Enter the phone number to send the test message to</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-2">
											<Label htmlFor="phone">Phone Number</Label>
											<Input
												id="phone"
												placeholder="+1234567890"
												value={phoneNumber}
												onChange={(e) => setPhoneNumber(e.target.value)}
											/>
											<p className="text-xs text-muted-foreground">
												Enter the full phone number with country code (e.g., +1 for US)
											</p>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Template Parameters</CardTitle>
										<CardDescription>Fill in the values for the template parameters</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										{getTemplateParameters().length === 0 ? (
											<p className="text-sm text-muted-foreground">This template doesn&apos;t have any parameters.</p>
										) : (
											getTemplateParameters().map((param) => (
												<div key={param.name} className="space-y-2">
													<Label htmlFor={`param-${param.name}`}>
														{param.name
															.replace(/_/g, " ")
															.replace(/\b\w/g, (l) => l.toUpperCase())}
													</Label>
													<Input
														id={`param-${param.name}`}
														placeholder={param.placeholder}
														value={parameters[param.name] || ""}
														onChange={(e) => handleParameterChange(param.name, e.target.value)}
													/>
												</div>
											))
										)}
									</CardContent>
									<CardFooter>
										<Button
											className="w-full gap-2"
											onClick={handleSendTest}
											disabled={isSending || !isFormValid}
										>
											{isSending ? (
												"Sending..."
											) : (
												<>
													<Send className="h-4 w-4" />
													Send Test Message
												</>
											)}
										</Button>
									</CardFooter>
								</Card>

								{sendResult && (
									<Alert variant={sendResult.success ? "default" : "destructive"}>
										<AlertTitle>
											{sendResult.success ? (
												<div className="flex items-center gap-2">
													<Check className="h-4 w-4" />
													Success
												</div>
											) : (
												"Error"
											)}
										</AlertTitle>
										<AlertDescription>{sendResult.message}</AlertDescription>
									</Alert>
								)}
							</>
						)}
					</div>

					<div className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Preview</CardTitle>
								<CardDescription>How your message will appear to the recipient</CardDescription>
							</CardHeader>
							<CardContent>
								{selectedTemplate ? (
									<div className="space-y-3 p-4 bg-muted rounded-lg">
										{/* Render template preview based on components */}
										{selectedTemplate.components?.map((component: any, index: number) => (
											<div key={index}>
												{component.type === "HEADER" && (
													<div className="font-semibold text-sm">
														{component.format === "IMAGE" ? "📷 Image" : component.text}
													</div>
												)}
												{component.type === "BODY" && (
													<div className="text-sm">
														{component.text?.replace(/\{\{(\d+)\}\}/g, (match: string, num: string) => {
															const paramIndex = parseInt(num) - 1
															return parameters[`param_${paramIndex}`] || `[Parameter ${paramIndex + 1}]`
														})}
													</div>
												)}
												{component.type === "FOOTER" && component.text && (
													<div className="text-xs text-muted-foreground">
														{component.text}
													</div>
												)}
												{component.type === "BUTTONS" && component.buttons && (
													<div className="space-y-1">
														{component.buttons.map((button: any, btnIndex: number) => (
															<div
																key={btnIndex}
																className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
															>
																🔗 {button.text}
															</div>
														))}
													</div>
												)}
											</div>
										))}
									</div>
								) : (
									<div className="text-center p-6 text-muted-foreground">
										Select a template to see preview
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Tips</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-2 text-sm">
									<li>• Test messages count toward your messaging limits</li>
									<li>• Only approved templates can be sent</li>
									<li>• The recipient must have opted in to receive messages</li>
									<li>• Parameters will be replaced with the values you provide</li>
									<li>• Use a real phone number that can receive WhatsApp messages</li>
									<li>• Templates are fetched from your Meta Business account</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	)
}
