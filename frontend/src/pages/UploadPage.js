// src/pages/UploadPage.js
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  Upload,
  File,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  ArrowRight,
  FileSpreadsheet,
  Users,
  BookOpen
} from 'lucide-react';
import api from '../services/api';

const UploadPage = ({ globalState, setGlobalState }) => {
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [uploadedFileData, setUploadedFileData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  // Configuração do dropzone
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Verificar arquivos rejeitados
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        toast.error('Arquivo muito grande. Máximo 10MB.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        toast.error('Tipo de arquivo inválido. Apenas Excel (.xlsx, .xls).');
      } else {
        toast.error('Erro no arquivo selecionado.');
      }
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    await handleFileUpload(file);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false)
  });

  // Função para fazer upload do arquivo
  const handleFileUpload = async (file) => {
    setUploadStatus('uploading');
    
    try {
      const formData = new FormData();
      formData.append('planilha', file);

      const response = await api.uploadFile(formData);
      
      setUploadStatus('success');
      setUploadedFileData({
        filename: response.filename,
        originalName: file.name,
        size: file.size,
        dados: response.dados
      });

      // Salvar no estado global
      setGlobalState(prev => ({
        ...prev,
        uploadedFile: {
          filename: response.filename,
          originalName: file.name,
          dados: response.dados
        }
      }));

      toast.success('Arquivo enviado e processado com sucesso!');
      
    } catch (error) {
      setUploadStatus('error');
      console.error('Erro no upload:', error);
      const msg = error?.message || error?.response?.data?.error;
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (msg) {
        toast.error(msg);
      } else {
        toast.error('Erro ao enviar arquivo. Tente novamente.');
      }
    }
  };

  // Resetar upload
  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadedFileData(null);
    setGlobalState(prev => ({ ...prev, uploadedFile: null }));
  };

  // Prosseguir para otimização
  const proceedToOptimization = () => {
    if (uploadedFileData) {
      navigate('/optimization');
    }
  };

  // Formatação de tamanho de arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upload de Dados de Reprovações
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Envie sua planilha Excel com os dados de reprovações dos alunos. 
            O sistema processará automaticamente as informações e preparará para otimização.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Selecionar Arquivo
              </h2>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
                  ${isDragAccept ? 'border-green-400 bg-green-50' : ''}
                  ${isDragReject ? 'border-red-400 bg-red-50' : ''}
                  ${!isDragActive && uploadStatus === 'idle' ? 'border-gray-300 hover:border-blue-400 hover:bg-blue-50' : ''}
                  ${uploadStatus === 'success' ? 'border-green-400 bg-green-50' : ''}
                  ${uploadStatus === 'error' ? 'border-red-400 bg-red-50' : ''}
                `}
              >
                <input {...getInputProps()} />
                
                {/* Upload States */}
                {uploadStatus === 'idle' && (
                  <div>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte seu arquivo aqui'}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      ou clique para selecionar
                    </p>
                    <div className="bg-blue-600 text-white px-6 py-2 rounded-lg inline-block font-medium">
                      Escolher Arquivo
                    </div>
                  </div>
                )}

                {uploadStatus === 'uploading' && (
                  <div>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-medium text-gray-900">
                      Enviando e processando arquivo...
                    </p>
                    <p className="text-sm text-gray-500">
                      Por favor, aguarde
                    </p>
                  </div>
                )}

                {uploadStatus === 'success' && uploadedFileData && (
                  <div>
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Arquivo processado com sucesso!
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      {uploadedFileData.originalName} ({formatFileSize(uploadedFileData.size)})
                    </p>
                    <div className="flex space-x-4 justify-center">
                      <button
                        onClick={proceedToOptimization}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <span>Prosseguir</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={resetUpload}
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Novo Upload
                      </button>
                    </div>
                  </div>
                )}

                {uploadStatus === 'error' && (
                  <div>
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Erro ao processar arquivo
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Verifique o formato e tente novamente
                    </p>
                    <button
                      onClick={resetUpload}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                )}
              </div>

              {/* File Requirements */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Requisitos do Arquivo:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Formato: Excel (.xlsx ou .xls)</li>
                  <li>• Tamanho máximo: 10MB</li>
                  <li>• Deve conter colunas com códigos das disciplinas (CCCD0001, CCCD0002, etc.)</li>
                  <li>• Reprovações marcadas com "X" nas respectivas disciplinas</li>
                  <li>• Colunas: Matrícula, Nome, Polo (obrigatórias)</li>
                </ul>
              </div>
            </div>

            {/* Data Preview */}
            {uploadedFileData && uploadedFileData.dados && (
              <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Resumo dos Dados Processados
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {uploadedFileData.dados.totalAlunos}
                    </div>
                    <div className="text-sm text-gray-600">Total de Alunos</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {uploadedFileData.dados.totalDisciplinas}
                    </div>
                    <div className="text-sm text-gray-600">Total de Disciplinas</div>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">
                      {uploadedFileData.dados.alunosComReprovacoes}
                    </div>
                    <div className="text-sm text-gray-600">Alunos com Reprovações</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Dados Prontos para Otimização</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Os dados foram processados com sucesso. Você pode prosseguir para configurar 
                        os parâmetros do algoritmo genético e executar a otimização.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Como Usar
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-1 rounded">
                    <File className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">1. Preparar Planilha</h4>
                    <p className="text-sm text-gray-600">
                      Organize os dados com as colunas obrigatórias
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-1 rounded">
                    <Upload className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">2. Fazer Upload</h4>
                    <p className="text-sm text-gray-600">
                      Arraste e solte ou selecione o arquivo
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-1 rounded">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">3. Verificar Dados</h4>
                    <p className="text-sm text-gray-600">
                      Conferir se os dados foram processados corretamente
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample File */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Arquivo de Exemplo
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Baixe um modelo de planilha para entender o formato esperado.
              </p>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Baixar Exemplo</span>
              </button>
            </div>

            {/* Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Precisa de Ajuda?
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                Se você tem dúvidas sobre o formato da planilha ou está enfrentando 
                problemas no upload, consulte nossa documentação.
              </p>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">
                Ver Documentação →
              </button>
            </div>

            {/* Technical Info */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informações Técnicas
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Formatos suportados:</span>
                  <span className="font-medium">.xlsx, .xls</span>
                </div>
                <div className="flex justify-between">
                  <span>Tamanho máximo:</span>
                  <span className="font-medium">10 MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Processamento:</span>
                  <span className="font-medium">Automático</span>
                </div>
                <div className="flex justify-between">
                  <span>Validação:</span>
                  <span className="font-medium">Tempo real</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;