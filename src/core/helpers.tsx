export default function formatDate(date: any) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' +
           dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  const forPull = () => {
    
  }