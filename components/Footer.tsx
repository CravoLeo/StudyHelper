import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Study Helper. Todos os direitos reservados.
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end space-x-6 text-sm">
            <Link 
              href="/terms" 
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 min-h-[44px] flex items-center"
            >
              Termos de Serviço
            </Link>
            <Link 
              href="/privacy" 
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 min-h-[44px] flex items-center"
            >
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 