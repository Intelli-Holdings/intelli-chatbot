# Backend Implementation Plan: Chatbot Automation App

## Overview

Create a Django app `chatbot_automation` to provide backend support for the flow builder feature. This app will handle CRUD operations for chatbot flows, flow execution engine, and real-time execution tracking.

---

## Architecture

### App Structure
```
chatbot_automation/
├── __init__.py
├── apps.py
├── models.py          # Flow, Execution models
├── serializers.py     # DRF serializers
├── views.py           # ViewSets for CRUD
├── urls.py            # REST API routes
├── permissions.py     # Organization access control
├── tasks.py           # Celery tasks for flow execution
├── consumers.py       # WebSocket for real-time updates
├── routing.py         # WebSocket routes
├── engine/            # Flow execution engine
│   ├── __init__.py
│   ├── executor.py    # Main execution engine
│   ├── nodes.py       # Node handlers
│   └── messaging.py   # WhatsApp message sending
├── admin.py           # Django admin
└── migrations/
```

---

## Phase 1: Core Models

### 1.1 models.py - Complete Implementation

```python
import uuid
from django.db import models
from django.utils import timezone
from auth_app.models import Organization
from appservice.models import AppService


class ExecutionStatus(models.TextChoices):
    """Status choices for flow execution"""
    PENDING = 'pending', 'Pending'
    RUNNING = 'running', 'Running'
    WAITING_FOR_INPUT = 'waiting_for_input', 'Waiting for Input'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    CANCELLED = 'cancelled', 'Cancelled'


class NodeType(models.TextChoices):
    """Node types matching the frontend flow builder"""
    START = 'start', 'Start/Trigger'
    TEXT = 'text', 'Text Message'
    QUESTION = 'question', 'Interactive Question'
    MEDIA = 'media', 'Media Message'
    CONDITION = 'condition', 'Condition Branch'
    USER_INPUT_FLOW = 'user_input_flow', 'User Input Flow'
    QUESTION_INPUT = 'question_input', 'Question Input'
    ACTION = 'action', 'Action'


class ChatbotFlow(models.Model):
    """
    Main model storing the chatbot flow configuration.
    Stores React Flow nodes/edges as JSON for flexibility.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='chatbot_flows',
        help_text="Organization this flow belongs to"
    )

    # Basic info
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    # Flow data - stores React Flow format directly
    nodes = models.JSONField(
        default=list,
        help_text="React Flow nodes array"
    )
    edges = models.JSONField(
        default=list,
        help_text="React Flow edges array"
    )
    menus = models.JSONField(
        default=list,
        help_text="Menu definitions for question nodes"
    )

    # Status
    is_active = models.BooleanField(
        default=False,
        help_text="Whether this flow is active and processing messages"
    )
    is_published = models.BooleanField(
        default=False,
        help_text="Whether this flow has been published"
    )

    # Trigger configuration - extracted from start nodes for fast lookup
    trigger_keywords = models.JSONField(
        default=list,
        help_text="Keywords that trigger this flow (lowercase)"
    )

    # Stats
    execution_count = models.PositiveIntegerField(default=0)
    last_executed_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['organization', 'is_active']),
            models.Index(fields=['organization', 'created_at']),
        ]
        verbose_name = 'Chatbot Flow'
        verbose_name_plural = 'Chatbot Flows'

    def __str__(self):
        return f"{self.name} ({self.organization.name})"

    @staticmethod
    def autocomplete_search_fields():
        return ("name", "organization__name")

    def extract_trigger_keywords(self):
        """Extract trigger keywords from start nodes"""
        keywords = []
        for node in self.nodes:
            if node.get('type') == 'start':
                data = node.get('data', {})
                node_keywords = data.get('keywords', [])
                keywords.extend([k.lower().strip() for k in node_keywords if k])
        return list(set(keywords))

    def save(self, *args, **kwargs):
        # Auto-extract trigger keywords before saving
        self.trigger_keywords = self.extract_trigger_keywords()
        super().save(*args, **kwargs)

    def publish(self):
        """Publish the flow"""
        self.is_published = True
        self.is_active = True
        self.published_at = timezone.now()
        self.save(update_fields=['is_published', 'is_active', 'published_at', 'updated_at'])

    def unpublish(self):
        """Unpublish the flow"""
        self.is_active = False
        self.save(update_fields=['is_active', 'updated_at'])

    def get_start_node_for_keyword(self, keyword: str):
        """Find the start node that matches the given keyword"""
        keyword_lower = keyword.lower().strip()
        for node in self.nodes:
            if node.get('type') == 'start':
                data = node.get('data', {})
                node_keywords = [k.lower().strip() for k in data.get('keywords', [])]
                if keyword_lower in node_keywords:
                    return node
        return None

    def get_node_by_id(self, node_id: str):
        """Get a node by its ID"""
        for node in self.nodes:
            if node.get('id') == node_id:
                return node
        return None

    def get_connected_node(self, source_node_id: str, source_handle: str = None):
        """Get the node connected to the given source node/handle"""
        for edge in self.edges:
            if edge.get('source') == source_node_id:
                if source_handle is None or edge.get('sourceHandle') == source_handle:
                    target_id = edge.get('target')
                    return self.get_node_by_id(target_id)
        return None


class FlowExecution(models.Model):
    """
    Tracks each flow execution for analytics and debugging.
    One execution per contact interaction with a flow.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    flow = models.ForeignKey(
        ChatbotFlow,
        on_delete=models.CASCADE,
        related_name='executions'
    )

    # Execution context
    contact_id = models.CharField(
        max_length=255,
        help_text="WhatsApp contact ID (phone number)"
    )
    trigger_keyword = models.CharField(
        max_length=255,
        help_text="Keyword that triggered this execution"
    )

    # State tracking
    status = models.CharField(
        max_length=20,
        choices=ExecutionStatus.choices,
        default=ExecutionStatus.PENDING
    )
    current_node_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="ID of the node currently being processed"
    )
    waiting_handle = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Handle/option being waited for (for question nodes)"
    )
    visited_nodes = models.JSONField(
        default=list,
        help_text="List of node IDs that have been visited"
    )
    collected_variables = models.JSONField(
        default=dict,
        help_text="Variables collected during execution"
    )

    # Timing
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Error tracking
    error_message = models.TextField(blank=True)
    error_node_id = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['flow', 'status']),
            models.Index(fields=['contact_id', 'status']),
            models.Index(fields=['flow', 'started_at']),
        ]
        verbose_name = 'Flow Execution'
        verbose_name_plural = 'Flow Executions'

    def __str__(self):
        return f"Execution {self.id} - {self.flow.name} ({self.status})"

    def mark_completed(self):
        """Mark execution as completed"""
        self.status = ExecutionStatus.COMPLETED
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'completed_at'])

    def mark_failed(self, error_message: str, error_node_id: str = None):
        """Mark execution as failed"""
        self.status = ExecutionStatus.FAILED
        self.error_message = error_message
        self.error_node_id = error_node_id
        self.completed_at = timezone.now()
        self.save(update_fields=['status', 'error_message', 'error_node_id', 'completed_at'])

    def mark_waiting(self, node_id: str, handle: str = None):
        """Mark execution as waiting for user input"""
        self.status = ExecutionStatus.WAITING_FOR_INPUT
        self.current_node_id = node_id
        self.waiting_handle = handle
        self.save(update_fields=['status', 'current_node_id', 'waiting_handle'])

    def add_visited_node(self, node_id: str):
        """Add a node to the visited list"""
        if node_id not in self.visited_nodes:
            self.visited_nodes.append(node_id)
            self.save(update_fields=['visited_nodes'])

    def set_variable(self, key: str, value):
        """Set a collected variable"""
        self.collected_variables[key] = value
        self.save(update_fields=['collected_variables'])


class FlowExecutionLog(models.Model):
    """
    Detailed logs for each step in an execution.
    Used for debugging and analytics.
    """
    id = models.BigAutoField(primary_key=True)
    execution = models.ForeignKey(
        FlowExecution,
        on_delete=models.CASCADE,
        related_name='logs'
    )

    node_id = models.CharField(max_length=100)
    node_type = models.CharField(max_length=50)
    action = models.CharField(
        max_length=50,
        help_text="Action: entered, exited, waiting, sent_message, error"
    )

    # Details
    input_data = models.JSONField(null=True, blank=True)
    output_data = models.JSONField(null=True, blank=True)
    message = models.TextField(blank=True)

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['execution', 'timestamp']),
            models.Index(fields=['node_id']),
        ]
        verbose_name = 'Execution Log'
        verbose_name_plural = 'Execution Logs'

    def __str__(self):
        return f"{self.execution_id} - {self.node_id} - {self.action}"
```

---

## Phase 2: Serializers

### 2.1 serializers.py

```python
from rest_framework import serializers
from django.utils import timezone
from .models import ChatbotFlow, FlowExecution, FlowExecutionLog


class ChatbotFlowListSerializer(serializers.ModelSerializer):
    """Serializer for listing flows - minimal fields"""
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    node_count = serializers.SerializerMethodField()
    trigger_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatbotFlow
        fields = [
            'id', 'name', 'description', 'organization', 'organization_name',
            'is_active', 'is_published', 'trigger_keywords',
            'node_count', 'trigger_count',
            'execution_count', 'last_executed_at',
            'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'published_at',
                           'execution_count', 'last_executed_at']

    def get_node_count(self, obj):
        return len(obj.nodes) if obj.nodes else 0

    def get_trigger_count(self, obj):
        return len(obj.trigger_keywords) if obj.trigger_keywords else 0


class ChatbotFlowSerializer(serializers.ModelSerializer):
    """Full serializer for flow detail/create/update"""
    organization_name = serializers.CharField(source='organization.name', read_only=True)

    class Meta:
        model = ChatbotFlow
        fields = [
            'id', 'name', 'description', 'organization', 'organization_name',
            'nodes', 'edges', 'menus',
            'is_active', 'is_published', 'trigger_keywords',
            'execution_count', 'last_executed_at',
            'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = ['id', 'trigger_keywords', 'created_at', 'updated_at',
                           'published_at', 'execution_count', 'last_executed_at']

    def validate_nodes(self, value):
        """Validate nodes structure"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Nodes must be a list")

        # Check for at least one start node
        start_nodes = [n for n in value if n.get('type') == 'start']
        if not start_nodes:
            raise serializers.ValidationError("Flow must have at least one start/trigger node")

        # Check each start node has keywords
        for node in start_nodes:
            data = node.get('data', {})
            keywords = data.get('keywords', [])
            if not keywords:
                raise serializers.ValidationError(
                    f"Start node '{node.get('id')}' must have at least one trigger keyword"
                )

        return value

    def validate_edges(self, value):
        """Validate edges structure"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Edges must be a list")
        return value


class ChatbotFlowCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating flows"""

    class Meta:
        model = ChatbotFlow
        fields = ['organization', 'name', 'description', 'nodes', 'edges', 'menus']


class FlowExecutionLogSerializer(serializers.ModelSerializer):
    """Serializer for execution logs"""

    class Meta:
        model = FlowExecutionLog
        fields = ['id', 'node_id', 'node_type', 'action', 'input_data',
                  'output_data', 'message', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class FlowExecutionSerializer(serializers.ModelSerializer):
    """Full serializer for execution detail"""
    flow_name = serializers.CharField(source='flow.name', read_only=True)
    logs = FlowExecutionLogSerializer(many=True, read_only=True)
    duration_seconds = serializers.SerializerMethodField()

    class Meta:
        model = FlowExecution
        fields = [
            'id', 'flow', 'flow_name', 'contact_id', 'trigger_keyword',
            'status', 'current_node_id', 'waiting_handle',
            'visited_nodes', 'collected_variables',
            'started_at', 'completed_at', 'duration_seconds',
            'error_message', 'error_node_id', 'logs'
        ]
        read_only_fields = ['id', 'started_at']

    def get_duration_seconds(self, obj):
        if obj.completed_at and obj.started_at:
            return (obj.completed_at - obj.started_at).total_seconds()
        elif obj.started_at:
            return (timezone.now() - obj.started_at).total_seconds()
        return None


class FlowExecutionListSerializer(serializers.ModelSerializer):
    """Serializer for listing executions - minimal fields"""
    flow_name = serializers.CharField(source='flow.name', read_only=True)

    class Meta:
        model = FlowExecution
        fields = [
            'id', 'flow', 'flow_name', 'contact_id', 'trigger_keyword',
            'status', 'started_at', 'completed_at'
        ]
        read_only_fields = ['id', 'started_at']
```

---

## Phase 3: Views

### 3.1 views.py

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Count

from auth_app.clerk_authentication import ClerkJWTAuthentication
from .models import ChatbotFlow, FlowExecution, ExecutionStatus
from .serializers import (
    ChatbotFlowSerializer,
    ChatbotFlowListSerializer,
    ChatbotFlowCreateSerializer,
    FlowExecutionSerializer,
    FlowExecutionListSerializer,
)
from .permissions import IsOrganizationMember


class FlowPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ChatbotFlowViewSet(viewsets.ModelViewSet):
    """
    ViewSet for chatbot flow CRUD operations.

    Endpoints:
    - GET /flows/ - List all flows for organization
    - POST /flows/ - Create new flow
    - GET /flows/{id}/ - Get flow details
    - PUT /flows/{id}/ - Update flow
    - DELETE /flows/{id}/ - Delete flow
    - POST /flows/{id}/duplicate/ - Duplicate flow
    - POST /flows/{id}/publish/ - Publish flow
    - POST /flows/{id}/unpublish/ - Unpublish flow
    - GET /flows/{id}/validate/ - Validate flow
    - GET /flows/{id}/stats/ - Get flow statistics
    """
    queryset = ChatbotFlow.objects.all()
    pagination_class = FlowPagination
    authentication_classes = [ClerkJWTAuthentication]
    permission_classes = [IsAuthenticated, IsOrganizationMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'organization': ['exact'],
        'is_active': ['exact'],
        'is_published': ['exact'],
    }

    def get_serializer_class(self):
        if self.action == 'list':
            return ChatbotFlowListSerializer
        if self.action == 'create':
            return ChatbotFlowCreateSerializer
        return ChatbotFlowSerializer

    def get_queryset(self):
        org_id = self.request.query_params.get('organization_id') or \
                 self.request.data.get('organization_id') or \
                 self.request.data.get('organization')

        queryset = ChatbotFlow.objects.select_related('organization')

        if org_id:
            queryset = queryset.filter(organization_id=org_id)

        return queryset.order_by('-updated_at')

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate an existing flow"""
        flow = self.get_object()

        # Create new flow with copied data
        new_flow = ChatbotFlow.objects.create(
            organization=flow.organization,
            name=f"{flow.name} (Copy)",
            description=flow.description,
            nodes=flow.nodes.copy() if flow.nodes else [],
            edges=flow.edges.copy() if flow.edges else [],
            menus=flow.menus.copy() if flow.menus else [],
            is_active=False,
            is_published=False,
        )

        serializer = ChatbotFlowSerializer(new_flow)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish a flow to make it active"""
        flow = self.get_object()

        # Validate before publishing
        validation = self._validate_flow(flow)
        if validation['errors']:
            return Response({
                'status': 'error',
                'message': 'Flow has validation errors',
                'validation': validation
            }, status=status.HTTP_400_BAD_REQUEST)

        flow.publish()

        return Response({
            'status': 'published',
            'message': f"Flow '{flow.name}' is now active",
            'published_at': flow.published_at.isoformat()
        })

    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        """Unpublish a flow to deactivate it"""
        flow = self.get_object()
        flow.unpublish()

        return Response({
            'status': 'unpublished',
            'message': f"Flow '{flow.name}' is now inactive"
        })

    @action(detail=True, methods=['get'])
    def validate(self, request, pk=None):
        """Validate flow configuration"""
        flow = self.get_object()
        validation = self._validate_flow(flow)

        return Response(validation)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get flow statistics"""
        flow = self.get_object()

        executions = flow.executions.all()

        stats = {
            'total_executions': executions.count(),
            'completed': executions.filter(status=ExecutionStatus.COMPLETED).count(),
            'failed': executions.filter(status=ExecutionStatus.FAILED).count(),
            'running': executions.filter(
                status__in=[ExecutionStatus.RUNNING, ExecutionStatus.WAITING_FOR_INPUT]
            ).count(),
            'last_executed_at': flow.last_executed_at,
            'trigger_keywords': flow.trigger_keywords,
        }

        return Response(stats)

    def _validate_flow(self, flow):
        """Validate flow configuration"""
        errors = []
        warnings = []

        nodes = flow.nodes or []
        edges = flow.edges or []

        # Check for start nodes
        start_nodes = [n for n in nodes if n.get('type') == 'start']
        if not start_nodes:
            errors.append({
                'type': 'error',
                'message': 'Flow must have at least one trigger node',
                'nodeId': None
            })

        # Check each start node has keywords
        for node in start_nodes:
            data = node.get('data', {})
            if not data.get('keywords'):
                errors.append({
                    'type': 'error',
                    'message': 'Trigger node must have at least one keyword',
                    'nodeId': node.get('id')
                })

        # Check for disconnected nodes (except start nodes)
        node_ids = {n.get('id') for n in nodes}
        connected_targets = {e.get('target') for e in edges}
        connected_sources = {e.get('source') for e in edges}

        for node in nodes:
            node_id = node.get('id')
            node_type = node.get('type')

            # Start nodes don't need incoming connections
            if node_type == 'start':
                if node_id not in connected_sources:
                    warnings.append({
                        'type': 'warning',
                        'message': 'Trigger node has no outgoing connections',
                        'nodeId': node_id
                    })
            else:
                # Other nodes should have incoming connections
                if node_id not in connected_targets:
                    warnings.append({
                        'type': 'warning',
                        'message': 'Node is not connected to the flow',
                        'nodeId': node_id
                    })

        # Check text nodes have content
        for node in nodes:
            if node.get('type') == 'text':
                data = node.get('data', {})
                if not data.get('text'):
                    errors.append({
                        'type': 'error',
                        'message': 'Text node must have message content',
                        'nodeId': node.get('id')
                    })

        # Check question nodes have options
        for node in nodes:
            if node.get('type') == 'question':
                data = node.get('data', {})
                options = data.get('options', [])
                if not options:
                    errors.append({
                        'type': 'error',
                        'message': 'Question node must have at least one option',
                        'nodeId': node.get('id')
                    })

        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'warnings': warnings,
            'errorCount': len(errors),
            'warningCount': len(warnings)
        }


class FlowExecutionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing flow executions (read-only).

    Endpoints:
    - GET /executions/ - List executions
    - GET /executions/{id}/ - Get execution details with logs
    - POST /executions/{id}/cancel/ - Cancel running execution
    """
    queryset = FlowExecution.objects.all()
    pagination_class = FlowPagination
    authentication_classes = [ClerkJWTAuthentication]
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {
        'flow': ['exact'],
        'flow__organization': ['exact'],
        'status': ['exact', 'in'],
        'contact_id': ['exact'],
    }

    def get_serializer_class(self):
        if self.action == 'list':
            return FlowExecutionListSerializer
        return FlowExecutionSerializer

    def get_queryset(self):
        org_id = self.request.query_params.get('organization_id')
        flow_id = self.request.query_params.get('flow_id')

        queryset = FlowExecution.objects.select_related('flow', 'flow__organization')

        if org_id:
            queryset = queryset.filter(flow__organization_id=org_id)
        if flow_id:
            queryset = queryset.filter(flow_id=flow_id)

        return queryset.order_by('-started_at')

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a running execution"""
        execution = self.get_object()

        if execution.status in [ExecutionStatus.COMPLETED, ExecutionStatus.FAILED,
                                ExecutionStatus.CANCELLED]:
            return Response({
                'status': 'error',
                'message': 'Execution is already finished'
            }, status=status.HTTP_400_BAD_REQUEST)

        execution.status = ExecutionStatus.CANCELLED
        execution.completed_at = timezone.now()
        execution.save(update_fields=['status', 'completed_at'])

        return Response({
            'status': 'cancelled',
            'message': 'Execution has been cancelled'
        })
```

---

## Phase 4: Flow Execution Engine

### 4.1 engine/messaging.py - WhatsApp Message Sending

```python
"""
WhatsApp messaging utilities for the flow execution engine.
Wraps existing appservice utilities for sending different message types.
"""
import os
import logging
import requests
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

VERSION = os.getenv("VERSION", "v17.0")


def send_text_message(
    phone_number_id: str,
    access_token: str,
    recipient: str,
    text: str
) -> Optional[Dict[str, Any]]:
    """Send a text message via WhatsApp"""
    url = f"https://graph.facebook.com/{VERSION}/{phone_number_id}/messages"

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": recipient,
        "type": "text",
        "text": {"preview_url": False, "body": text}
    }

    headers = {
        "Content-type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response_data = response.json()

        if response.status_code != 200:
            logger.error(f"WhatsApp API error: {response_data}")
            return None

        logger.info(f"Text message sent to {recipient}")
        return response_data
    except Exception as e:
        logger.error(f"Error sending text message: {e}")
        return None


def send_interactive_buttons(
    phone_number_id: str,
    access_token: str,
    recipient: str,
    body_text: str,
    buttons: List[Dict[str, str]],
    header_text: str = None,
    footer_text: str = None
) -> Optional[Dict[str, Any]]:
    """
    Send an interactive button message via WhatsApp.

    Args:
        buttons: List of dicts with 'id' and 'title' keys (max 3 buttons)
    """
    url = f"https://graph.facebook.com/{VERSION}/{phone_number_id}/messages"

    # Build interactive payload
    interactive = {
        "type": "button",
        "body": {"text": body_text},
        "action": {
            "buttons": [
                {
                    "type": "reply",
                    "reply": {
                        "id": btn.get('id', str(i)),
                        "title": btn.get('title', '')[:20]  # Max 20 chars
                    }
                }
                for i, btn in enumerate(buttons[:3])  # Max 3 buttons
            ]
        }
    }

    if header_text:
        interactive["header"] = {"type": "text", "text": header_text}
    if footer_text:
        interactive["footer"] = {"text": footer_text}

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": recipient,
        "type": "interactive",
        "interactive": interactive
    }

    headers = {
        "Content-type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response_data = response.json()

        if response.status_code != 200:
            logger.error(f"WhatsApp API error: {response_data}")
            return None

        logger.info(f"Interactive buttons sent to {recipient}")
        return response_data
    except Exception as e:
        logger.error(f"Error sending interactive buttons: {e}")
        return None


def send_interactive_list(
    phone_number_id: str,
    access_token: str,
    recipient: str,
    body_text: str,
    button_text: str,
    sections: List[Dict[str, Any]],
    header_text: str = None,
    footer_text: str = None
) -> Optional[Dict[str, Any]]:
    """
    Send an interactive list message via WhatsApp.

    Args:
        sections: List of section dicts with 'title' and 'rows' keys
                  Each row has 'id', 'title', and optional 'description'
    """
    url = f"https://graph.facebook.com/{VERSION}/{phone_number_id}/messages"

    interactive = {
        "type": "list",
        "body": {"text": body_text},
        "action": {
            "button": button_text[:20],  # Max 20 chars
            "sections": sections
        }
    }

    if header_text:
        interactive["header"] = {"type": "text", "text": header_text}
    if footer_text:
        interactive["footer"] = {"text": footer_text}

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": recipient,
        "type": "interactive",
        "interactive": interactive
    }

    headers = {
        "Content-type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response_data = response.json()

        if response.status_code != 200:
            logger.error(f"WhatsApp API error: {response_data}")
            return None

        logger.info(f"Interactive list sent to {recipient}")
        return response_data
    except Exception as e:
        logger.error(f"Error sending interactive list: {e}")
        return None


def send_media_message(
    phone_number_id: str,
    access_token: str,
    recipient: str,
    media_type: str,
    media_url: str,
    caption: str = None,
    filename: str = None
) -> Optional[Dict[str, Any]]:
    """
    Send a media message via WhatsApp.

    Args:
        media_type: 'image', 'video', 'audio', or 'document'
        media_url: Public URL of the media file
        caption: Optional caption (for image/video/document)
        filename: Optional filename (for document)
    """
    url = f"https://graph.facebook.com/{VERSION}/{phone_number_id}/messages"

    media_object = {"link": media_url}
    if caption and media_type in ['image', 'video', 'document']:
        media_object["caption"] = caption
    if filename and media_type == 'document':
        media_object["filename"] = filename

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": recipient,
        "type": media_type,
        media_type: media_object
    }

    headers = {
        "Content-type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response_data = response.json()

        if response.status_code != 200:
            logger.error(f"WhatsApp API error: {response_data}")
            return None

        logger.info(f"Media message ({media_type}) sent to {recipient}")
        return response_data
    except Exception as e:
        logger.error(f"Error sending media message: {e}")
        return None
```

### 4.2 engine/executor.py - Main Execution Engine

```python
"""
Flow Execution Engine - Processes chatbot flows node by node.
"""
import re
import logging
from typing import Dict, Any, Optional, Tuple
from django.utils import timezone

from ..models import ChatbotFlow, FlowExecution, FlowExecutionLog, ExecutionStatus
from .messaging import (
    send_text_message,
    send_interactive_buttons,
    send_interactive_list,
    send_media_message
)

logger = logging.getLogger(__name__)


class FlowExecutionEngine:
    """
    Executes chatbot flows node by node.

    Handles:
    - Start node keyword matching
    - Message sending (text, media, interactive)
    - User input collection
    - Condition evaluation
    - Variable interpolation
    - Action execution (AI handoff, end)
    """

    def __init__(
        self,
        flow: ChatbotFlow,
        contact_id: str,
        phone_number_id: str,
        access_token: str
    ):
        self.flow = flow
        self.contact_id = contact_id
        self.phone_number_id = phone_number_id
        self.access_token = access_token
        self.execution: Optional[FlowExecution] = None
        self.variables: Dict[str, Any] = {}

    @classmethod
    def from_execution(cls, execution: FlowExecution, phone_number_id: str, access_token: str):
        """Create engine from an existing execution"""
        engine = cls(
            flow=execution.flow,
            contact_id=execution.contact_id,
            phone_number_id=phone_number_id,
            access_token=access_token
        )
        engine.execution = execution
        engine.variables = execution.collected_variables.copy()
        return engine

    def start(self, keyword: str) -> Optional[FlowExecution]:
        """Start flow execution from matching trigger keyword"""
        # Find the start node that matches the keyword
        start_node = self.flow.get_start_node_for_keyword(keyword)
        if not start_node:
            logger.warning(f"No start node found for keyword: {keyword}")
            return None

        # Create execution record
        self.execution = FlowExecution.objects.create(
            flow=self.flow,
            contact_id=self.contact_id,
            trigger_keyword=keyword,
            status=ExecutionStatus.RUNNING,
            current_node_id=start_node.get('id')
        )

        # Update flow stats
        self.flow.execution_count += 1
        self.flow.last_executed_at = timezone.now()
        self.flow.save(update_fields=['execution_count', 'last_executed_at'])

        self._log('entered', start_node)

        # Process the start node and continue
        self._process_start_node(start_node)

        return self.execution

    def handle_user_input(self, input_text: str, option_id: str = None) -> bool:
        """
        Handle incoming user message during execution.
        Returns True if processed, False if execution is complete/invalid.
        """
        if not self.execution:
            return False

        if self.execution.status != ExecutionStatus.WAITING_FOR_INPUT:
            return False

        current_node = self.flow.get_node_by_id(self.execution.current_node_id)
        if not current_node:
            self.execution.mark_failed("Current node not found")
            return False

        node_type = current_node.get('type')

        # Handle based on node type
        if node_type == 'question':
            return self._handle_question_response(current_node, input_text, option_id)
        elif node_type == 'question_input':
            return self._handle_question_input_response(current_node, input_text)
        elif node_type == 'user_input_flow':
            return self._handle_user_input_flow_response(current_node, input_text)
        else:
            # Unknown node type waiting for input
            self.execution.mark_failed(f"Unknown waiting node type: {node_type}")
            return False

    def _process_node(self, node: Dict[str, Any]) -> Optional[str]:
        """
        Process a single node and return the next node ID.
        Returns None if waiting for input or execution is complete.
        """
        if not node:
            return None

        node_id = node.get('id')
        node_type = node.get('type')

        self.execution.current_node_id = node_id
        self.execution.add_visited_node(node_id)
        self._log('entered', node)

        # Process based on node type
        handler = getattr(self, f'_process_{node_type}_node', None)
        if handler:
            return handler(node)
        else:
            logger.warning(f"Unknown node type: {node_type}")
            return self._get_next_node_id(node_id)

    def _process_start_node(self, node: Dict[str, Any]) -> Optional[str]:
        """Process start/trigger node"""
        self._log('exited', node)
        next_node_id = self._get_next_node_id(node.get('id'))
        if next_node_id:
            next_node = self.flow.get_node_by_id(next_node_id)
            return self._process_node(next_node)
        return None

    def _process_text_node(self, node: Dict[str, Any]) -> Optional[str]:
        """Process text message node"""
        data = node.get('data', {})
        text = data.get('text', '')

        # Interpolate variables
        text = self._interpolate_variables(text)

        # Send message
        send_text_message(
            self.phone_number_id,
            self.access_token,
            self.contact_id,
            text
        )

        self._log('sent_message', node, output_data={'text': text})
        self._log('exited', node)

        # Continue to next node
        next_node_id = self._get_next_node_id(node.get('id'))
        if next_node_id:
            next_node = self.flow.get_node_by_id(next_node_id)
            return self._process_node(next_node)

        self.execution.mark_completed()
        return None

    def _process_question_node(self, node: Dict[str, Any]) -> Optional[str]:
        """Process interactive question node"""
        data = node.get('data', {})

        question_type = data.get('type', 'buttons')
        body_text = self._interpolate_variables(data.get('body', ''))
        header_text = self._interpolate_variables(data.get('header', ''))
        footer_text = self._interpolate_variables(data.get('footer', ''))
        options = data.get('options', [])

        if question_type == 'buttons' and len(options) <= 3:
            # Send as buttons
            buttons = [
                {'id': opt.get('id', str(i)), 'title': opt.get('title', '')}
                for i, opt in enumerate(options)
            ]
            send_interactive_buttons(
                self.phone_number_id,
                self.access_token,
                self.contact_id,
                body_text,
                buttons,
                header_text=header_text if header_text else None,
                footer_text=footer_text if footer_text else None
            )
        else:
            # Send as list
            button_text = data.get('buttonText', 'View Options')
            sections = [{
                'title': 'Options',
                'rows': [
                    {
                        'id': opt.get('id', str(i)),
                        'title': opt.get('title', ''),
                        'description': opt.get('description', '')
                    }
                    for i, opt in enumerate(options)
                ]
            }]
            send_interactive_list(
                self.phone_number_id,
                self.access_token,
                self.contact_id,
                body_text,
                button_text,
                sections,
                header_text=header_text if header_text else None,
                footer_text=footer_text if footer_text else None
            )

        self._log('sent_message', node, output_data={'type': question_type, 'options': options})

        # Wait for user response
        self.execution.mark_waiting(node.get('id'))
        return None

    def _process_media_node(self, node: Dict[str, Any]) -> Optional[str]:
        """Process media message node"""
        data = node.get('data', {})
        media_type = data.get('mediaType', 'image')
        media_url = data.get('mediaUrl', '')
        caption = self._interpolate_variables(data.get('caption', ''))
        filename = data.get('filename')

        if media_url:
            send_media_message(
                self.phone_number_id,
                self.access_token,
                self.contact_id,
                media_type,
                media_url,
                caption=caption if caption else None,
                filename=filename
            )
            self._log('sent_message', node, output_data={'media_type': media_type})

        self._log('exited', node)

        # Continue to next node
        next_node_id = self._get_next_node_id(node.get('id'))
        if next_node_id:
            next_node = self.flow.get_node_by_id(next_node_id)
            return self._process_node(next_node)

        self.execution.mark_completed()
        return None

    def _process_condition_node(self, node: Dict[str, Any]) -> Optional[str]:
        """Process condition branching node"""
        data = node.get('data', {})
        rules = data.get('rules', [])

        # Evaluate rules
        result = self._evaluate_conditions(rules)
        handle = 'true' if result else 'false'

        self._log('exited', node, output_data={'result': result, 'handle': handle})

        # Get the connected node based on result
        next_node = self.flow.get_connected_node(node.get('id'), handle)
        if next_node:
            return self._process_node(next_node)

        self.execution.mark_completed()
        return None

    def _process_action_node(self, node: Dict[str, Any]) -> Optional[str]:
        """Process action node (terminal actions)"""
        data = node.get('data', {})
        action_type = data.get('actionType', 'end')

        self._log('exited', node, output_data={'action_type': action_type})

        if action_type == 'fallback_ai':
            # Mark for AI handoff - set flag on execution
            self.execution.collected_variables['_handoff_to_ai'] = True
            self.execution.save(update_fields=['collected_variables'])
        elif action_type == 'end':
            # Just end the flow
            pass

        self.execution.mark_completed()
        return None

    def _process_question_input_node(self, node: Dict[str, Any]) -> Optional[str]:
        """Process question input node"""
        data = node.get('data', {})
        question = self._interpolate_variables(data.get('question', ''))

        # Send the question
        send_text_message(
            self.phone_number_id,
            self.access_token,
            self.contact_id,
            question
        )

        self._log('sent_message', node, output_data={'question': question})

        # Wait for user response
        self.execution.mark_waiting(node.get('id'))
        return None

    def _handle_question_response(
        self,
        node: Dict[str, Any],
        input_text: str,
        option_id: str = None
    ) -> bool:
        """Handle response to a question node"""
        data = node.get('data', {})
        save_to = data.get('saveAnswerTo')

        # Save the answer if configured
        if save_to:
            self.variables[save_to] = input_text
            self.execution.set_variable(save_to, input_text)

        self._log('exited', node, input_data={'response': input_text, 'option_id': option_id})

        # Find the next node based on option selected
        # The handle format is typically option-{option_id}
        handle = f"option-{option_id}" if option_id else None

        # Try to find connected node by handle
        next_node = None
        if handle:
            next_node = self.flow.get_connected_node(node.get('id'), handle)

        # If no specific handle match, use default output
        if not next_node:
            next_node = self.flow.get_connected_node(node.get('id'))

        if next_node:
            self.execution.status = ExecutionStatus.RUNNING
            self.execution.save(update_fields=['status'])
            self._process_node(next_node)
            return True

        self.execution.mark_completed()
        return True

    def _handle_question_input_response(self, node: Dict[str, Any], input_text: str) -> bool:
        """Handle response to a question input node"""
        data = node.get('data', {})
        variable_name = data.get('variableName', data.get('saveAnswerTo'))

        # Save the answer
        if variable_name:
            self.variables[variable_name] = input_text
            self.execution.set_variable(variable_name, input_text)

        self._log('exited', node, input_data={'response': input_text})

        # Continue to next node
        next_node = self.flow.get_connected_node(node.get('id'))
        if next_node:
            self.execution.status = ExecutionStatus.RUNNING
            self.execution.save(update_fields=['status'])
            self._process_node(next_node)
            return True

        self.execution.mark_completed()
        return True

    def _interpolate_variables(self, text: str) -> str:
        """Replace {{variable}} placeholders with actual values"""
        if not text:
            return text

        def replace_var(match):
            var_name = match.group(1).strip()
            return str(self.variables.get(var_name, match.group(0)))

        return re.sub(r'\{\{([^}]+)\}\}', replace_var, text)

    def _evaluate_conditions(self, rules: list) -> bool:
        """Evaluate condition rules"""
        if not rules:
            return True

        for rule in rules:
            field = rule.get('field', '')
            operator = rule.get('operator', 'equals')
            value = rule.get('value', '')

            # Get the field value from variables
            field_value = self.variables.get(field, '')

            # Evaluate based on operator
            if operator == 'equals':
                if str(field_value).lower() != str(value).lower():
                    return False
            elif operator == 'not_equals':
                if str(field_value).lower() == str(value).lower():
                    return False
            elif operator == 'contains':
                if str(value).lower() not in str(field_value).lower():
                    return False
            elif operator == 'not_contains':
                if str(value).lower() in str(field_value).lower():
                    return False
            elif operator == 'starts_with':
                if not str(field_value).lower().startswith(str(value).lower()):
                    return False
            elif operator == 'ends_with':
                if not str(field_value).lower().endswith(str(value).lower()):
                    return False
            elif operator == 'is_empty':
                if field_value:
                    return False
            elif operator == 'is_not_empty':
                if not field_value:
                    return False

        return True

    def _get_next_node_id(self, source_node_id: str, handle: str = None) -> Optional[str]:
        """Get the ID of the next connected node"""
        next_node = self.flow.get_connected_node(source_node_id, handle)
        return next_node.get('id') if next_node else None

    def _log(
        self,
        action: str,
        node: Dict[str, Any],
        input_data: Dict = None,
        output_data: Dict = None,
        message: str = ''
    ):
        """Create an execution log entry"""
        FlowExecutionLog.objects.create(
            execution=self.execution,
            node_id=node.get('id', ''),
            node_type=node.get('type', ''),
            action=action,
            input_data=input_data,
            output_data=output_data,
            message=message
        )
```

---

## Phase 5: Celery Tasks

### 5.1 tasks.py

```python
from celery import shared_task
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

from .models import ChatbotFlow, FlowExecution, ExecutionStatus
from .engine.executor import FlowExecutionEngine
from appservice.models import AppService

logger = logging.getLogger(__name__)


@shared_task(name="chatbot_automation.execute_flow", bind=True, max_retries=3)
def execute_flow_task(self, flow_id: str, contact_id: str, keyword: str, app_service_id: int):
    """
    Execute a chatbot flow asynchronously.

    Args:
        flow_id: UUID of the flow to execute
        contact_id: WhatsApp contact ID
        keyword: Trigger keyword that started the flow
        app_service_id: ID of the AppService to use for messaging
    """
    try:
        flow = ChatbotFlow.objects.get(id=flow_id)
        app_service = AppService.objects.get(id=app_service_id)

        engine = FlowExecutionEngine(
            flow=flow,
            contact_id=contact_id,
            phone_number_id=app_service.phone_number_id,
            access_token=app_service.access_token
        )

        execution = engine.start(keyword)

        if execution:
            # Broadcast execution started
            _broadcast_execution_update(execution, 'started')

            logger.info(f"Flow execution started: {execution.id}")
            return str(execution.id)

        return None

    except ChatbotFlow.DoesNotExist:
        logger.error(f"Flow {flow_id} not found")
        return None
    except AppService.DoesNotExist:
        logger.error(f"AppService {app_service_id} not found")
        return None
    except Exception as e:
        logger.error(f"Error executing flow: {e}", exc_info=True)
        raise self.retry(exc=e, countdown=60)


@shared_task(name="chatbot_automation.handle_user_input", bind=True, max_retries=3)
def handle_user_input_task(
    self,
    execution_id: str,
    input_text: str,
    option_id: str = None,
    app_service_id: int = None
):
    """
    Handle user input for a waiting flow execution.

    Args:
        execution_id: UUID of the execution
        input_text: User's input text
        option_id: Optional button/list option ID
        app_service_id: ID of the AppService
    """
    try:
        execution = FlowExecution.objects.select_related('flow').get(id=execution_id)
        app_service = AppService.objects.get(id=app_service_id)

        engine = FlowExecutionEngine.from_execution(
            execution,
            phone_number_id=app_service.phone_number_id,
            access_token=app_service.access_token
        )

        result = engine.handle_user_input(input_text, option_id)

        # Broadcast update
        execution.refresh_from_db()
        _broadcast_execution_update(execution, 'input_processed')

        return result

    except FlowExecution.DoesNotExist:
        logger.error(f"Execution {execution_id} not found")
        return False
    except Exception as e:
        logger.error(f"Error handling user input: {e}", exc_info=True)
        raise self.retry(exc=e, countdown=30)


def _broadcast_execution_update(execution: FlowExecution, event_type: str):
    """Broadcast execution update via WebSocket"""
    try:
        channel_layer = get_channel_layer()
        if not channel_layer:
            return

        async_to_sync(channel_layer.group_send)(
            f'execution_{execution.id}',
            {
                'type': 'execution_update',
                'data': {
                    'event': event_type,
                    'execution_id': str(execution.id),
                    'status': execution.status,
                    'current_node_id': execution.current_node_id,
                    'visited_nodes': execution.visited_nodes,
                    'timestamp': timezone.now().isoformat()
                }
            }
        )
    except Exception as e:
        logger.warning(f"Failed to broadcast execution update: {e}")
```

---

## Phase 6: Webhook Integration

### 6.1 Integration Point

Add to `appservice/api_with_schema_improved.py` in the `MetaWebhookAPIView.post` method:

```python
# At the top of the file, add import:
from chatbot_automation.services import check_and_handle_flow

# In the post method, before AI processing:
async def post(self, request, *args, **kwargs):
    # ... existing code ...

    # After extracting message data, before AI processing:
    if message_content and appservice:
        # Check for active flow execution or matching trigger
        flow_handled = await sync_to_async(check_and_handle_flow)(
            contact_id=customer_number,
            message_text=message_content,
            option_id=option_id,  # Extract from interactive reply if present
            app_service=appservice
        )

        if flow_handled:
            # Flow handled the message, skip AI processing
            return Response({'status': 'flow_handled'}, status=status.HTTP_200_OK)

    # Continue with existing AI processing...
```

### 6.2 services.py - Flow Handler Service

```python
"""
Service layer for chatbot flow handling.
Called from webhook to check and handle incoming messages.
"""
import logging
from typing import Optional
from .models import ChatbotFlow, FlowExecution, ExecutionStatus
from .tasks import execute_flow_task, handle_user_input_task
from appservice.models import AppService

logger = logging.getLogger(__name__)


def check_and_handle_flow(
    contact_id: str,
    message_text: str,
    option_id: Optional[str],
    app_service: AppService
) -> bool:
    """
    Check if there's an active flow execution or matching trigger.

    Returns True if the message was handled by a flow, False otherwise.
    """
    organization = app_service.organization
    if not organization:
        return False

    # Check for active execution waiting for input
    active_execution = FlowExecution.objects.filter(
        flow__organization=organization,
        contact_id=contact_id,
        status=ExecutionStatus.WAITING_FOR_INPUT
    ).select_related('flow').first()

    if active_execution:
        logger.info(f"Resuming execution {active_execution.id} with user input")

        # Queue task to handle user input
        handle_user_input_task.delay(
            execution_id=str(active_execution.id),
            input_text=message_text,
            option_id=option_id,
            app_service_id=app_service.id
        )
        return True

    # Check for matching trigger keyword
    keyword_lower = message_text.lower().strip()

    # Find active flow with matching trigger keyword
    matching_flow = ChatbotFlow.objects.filter(
        organization=organization,
        is_active=True,
        trigger_keywords__contains=[keyword_lower]
    ).first()

    if matching_flow:
        logger.info(f"Starting flow {matching_flow.id} with keyword: {keyword_lower}")

        # Queue task to execute flow
        execute_flow_task.delay(
            flow_id=str(matching_flow.id),
            contact_id=contact_id,
            keyword=message_text,
            app_service_id=app_service.id
        )
        return True

    return False
```

---

## Phase 7: URL Configuration

### 7.1 chatbot_automation/urls.py

```python
from rest_framework.routers import DefaultRouter
from .views import ChatbotFlowViewSet, FlowExecutionViewSet

router = DefaultRouter()
router.register(r'flows', ChatbotFlowViewSet, basename='chatbot-flows')
router.register(r'executions', FlowExecutionViewSet, basename='flow-executions')

urlpatterns = router.urls
```

### 7.2 Add to MAIN_PROJECT/urls.py

```python
path("chatbot_automation/", include("chatbot_automation.urls")),
```

### 7.3 Add to INSTALLED_APPS in settings.py

```python
INSTALLED_APPS = [
    # ... existing apps ...
    'chatbot_automation',
]
```

---

## Implementation Checklist

### Step 1: Create App Structure
- [ ] Create `chatbot_automation/` directory in backend root
- [ ] Create `__init__.py`, `apps.py`, `admin.py`
- [ ] Create `engine/` subdirectory with `__init__.py`

### Step 2: Models & Migrations
- [ ] Create `models.py` with ChatbotFlow, FlowExecution, FlowExecutionLog
- [ ] Add to `INSTALLED_APPS`
- [ ] Run `python manage.py makemigrations chatbot_automation`
- [ ] Run `python manage.py migrate`

### Step 3: Serializers & Views
- [ ] Create `serializers.py`
- [ ] Create `views.py` with ViewSets
- [ ] Create `permissions.py`
- [ ] Create `urls.py`
- [ ] Add to main `urls.py`

### Step 4: Execution Engine
- [ ] Create `engine/messaging.py`
- [ ] Create `engine/executor.py`

### Step 5: Services & Tasks
- [ ] Create `services.py`
- [ ] Create `tasks.py`
- [ ] Register tasks with Celery

### Step 6: Webhook Integration
- [ ] Modify `appservice/api_with_schema_improved.py` to call flow handler
- [ ] Test with webhook events

### Step 7: Admin & Testing
- [ ] Create `admin.py` for Django admin
- [ ] Write unit tests
- [ ] Test end-to-end flow execution

---

## Frontend Integration

After backend is complete, update frontend to call these endpoints:

```typescript
// services/chatbot-automation-api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// List flows
GET `${API_BASE}/chatbot_automation/flows/?organization_id=${orgId}`

// Create flow
POST `${API_BASE}/chatbot_automation/flows/`
Body: { organization, name, description, nodes, edges, menus }

// Update flow
PUT `${API_BASE}/chatbot_automation/flows/${flowId}/`

// Delete flow
DELETE `${API_BASE}/chatbot_automation/flows/${flowId}/`

// Publish flow
POST `${API_BASE}/chatbot_automation/flows/${flowId}/publish/`

// Unpublish flow
POST `${API_BASE}/chatbot_automation/flows/${flowId}/unpublish/`

// Duplicate flow
POST `${API_BASE}/chatbot_automation/flows/${flowId}/duplicate/`

// Validate flow
GET `${API_BASE}/chatbot_automation/flows/${flowId}/validate/`

// Get flow stats
GET `${API_BASE}/chatbot_automation/flows/${flowId}/stats/`

// List executions
GET `${API_BASE}/chatbot_automation/executions/?organization_id=${orgId}&flow_id=${flowId}`

// Get execution details
GET `${API_BASE}/chatbot_automation/executions/${executionId}/`
```
