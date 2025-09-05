// Contenido COMPLETO y VERIFICADO para: src/components/library/ManifestoArticle.jsx
import React from 'react';

const ManifestoArticle = ({ article }) => {
  if (!article) {
    return <p>Cargando manifiesto...</p>;
  }

  return (
    <article className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
        {article.title}
      </h2>
      <div className="prose prose-lg max-w-none text-gray-800 space-y-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: article.content }} />
      <details className="mt-10 bg-gray-50 p-4 rounded-lg border">
        <summary className="font-semibold cursor-pointer text-gray-700 hover:text-teal-600">
          Fuentes Científicas y Lecturas Recomendadas
        </summary>
        <ul className="mt-4 pl-6 list-disc text-sm text-gray-600 space-y-2">
          {article.sources.map((source, index) => (
            <li key={index}>
              <strong>{source.type}:</strong> <em>"{source.title}"</em> por {source.author}.
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
};

export default ManifestoArticle;
