import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { WorkloadPage } from './pages/WorkloadPage';
import { HuggingFacePage } from './pages/HuggingFacePage';
import { WorkloadType } from './types';
import { WORKLOAD_TYPE_OPTIONS } from './constants';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {WORKLOAD_TYPE_OPTIONS.map((option) => (
          <Route
            key={option.value}
            path={`/workload/${option.value}`}
            element={
              <WorkloadPage
                workloadType={option.value as WorkloadType}
                title={option.label}
                description={getWorkloadDescription(option.value as WorkloadType)}
              />
            }
          />
        ))}
        <Route path="/huggingface" element={<HuggingFacePage />} />
        {/* Catch-all redirect to home */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

function getWorkloadDescription(type: WorkloadType): string {
  switch (type) {
    case WorkloadType.LLM_FINETUNING:
      return 'Fine-tune large language models with custom datasets';
    case WorkloadType.EMBEDDING:
      return 'Generate vector embeddings for semantic search';
    case WorkloadType.RAG:
      return 'Build retrieval-augmented generation systems';
    case WorkloadType.MULTIMODAL:
      return 'Process text, images, and audio together';
    case WorkloadType.LOCAL_INFERENCE:
      return 'Run models locally with Ollama or LM Studio';
    default:
      return '';
  }
}

export default App;
